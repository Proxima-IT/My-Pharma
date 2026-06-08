"""
Product catalog filters: name (fuzzy), brand, ingredient (generic), price range, requires_prescription.
Aligned with PRODUCT_CATALOG.md search & filter logic.
"""
from django.db.models import Q
from django.db.models import F, FloatField, ExpressionWrapper
from django.db.models.functions import Cast
from django_filters import BooleanFilter, CharFilter, FilterSet, NumberFilter, OrderingFilter

from .models import Product


class ProductFilter(FilterSet):
    """
    Search & filter for product list.

    Supported query params:
    - search, category, brand_id, ingredient_id
    - price_min / price_max (legacy) OR min_price / max_price (alias)
    - available / in_stock: boolean (true/false). Both mean quantity_in_stock > 0.
    - requires_prescription, ordering
    """
    search = CharFilter(method="filter_search", label="Name search (fuzzy Levenshtein <= 2)")
    # category: accept id (int), slug (e.g. healthcare), or name (e.g. Healthcare)
    category = CharFilter(method="filter_category", label="Category (id, slug, or name)")
    brand_id = NumberFilter(field_name="brand_id", lookup_expr="exact")
    ingredient_id = NumberFilter(field_name="ingredient_id", lookup_expr="exact")
    price_min = NumberFilter(field_name="price", lookup_expr="gte")
    price_max = NumberFilter(field_name="price", lookup_expr="lte")
    # Friendlier aliases (frontend can use min_price/max_price)
    min_price = NumberFilter(field_name="price", lookup_expr="gte")
    max_price = NumberFilter(field_name="price", lookup_expr="lte")
    requires_prescription = BooleanFilter(field_name="requires_prescription")
    is_generic = BooleanFilter(field_name="is_generic")
    # Availability (stock)
    available = BooleanFilter(method="filter_in_stock")
    in_stock = BooleanFilter(method="filter_in_stock")
    # Discount
    discounted = BooleanFilter(method="filter_discounted")
    discount_min = NumberFilter(method="filter_discount_percent_min", label="Minimum discount percent (>=)")
    discount_max = NumberFilter(method="filter_discount_percent_max", label="Maximum discount percent (<=)")
    ordering = OrderingFilter(
        fields=(("price", "price"), ("name", "name"), ("created_at", "created_at")),
        field_labels={"price": "Price", "name": "Name", "created_at": "Created"},
    )

    class Meta:
        model = Product
        fields = ["is_active", "is_in_homepage", "brand_id", "ingredient_id", "requires_prescription", "is_generic"]

    def filter_category(self, queryset, name, value):
        if not value or not str(value).strip():
            return queryset
        value = str(value).strip()
        if value.isdigit():
            return queryset.filter(category_id=int(value))
        # Match by slug (case-insensitive) or name (case-insensitive)
        return queryset.filter(
            Q(category__slug__iexact=value) | Q(category__name__iexact=value)
        )

    def filter_search(self, queryset, name, value):
        if not value or not value.strip():
            return queryset
        value = value.strip()
        val_lower = value.lower()
        try:
            import Levenshtein
        except ImportError:
            Levenshtein = None
        if Levenshtein is None:
            return queryset.filter(Q(name__icontains=value) | Q(description__icontains=value))
        # Get candidate PKs from the filtered queryset (do not use .only() here: queryset
        # may have select_related, and deferring a traversed field causes FieldError).
        candidates = queryset.filter(Q(name__icontains=value) | Q(description__icontains=value))
        candidate_pks = list(candidates.values_list("pk", flat=True))
        
        # If no direct matches, try fuzzy matching against all products in queryset
        if not candidate_pks and len(val_lower) >= 2:
            candidate_pks = list(queryset.values_list("pk", flat=True))
            
        if not candidate_pks:
            return queryset.none()
            
        # Run Levenshtein on a separate minimal queryset (no select_related) to avoid conflict.
        pks = []
        for p in Product.objects.filter(pk__in=candidate_pks).only("pk", "name", "description").iterator():
            p_name_lower = p.name.lower()
            p_desc_lower = (p.description or "").lower()
            
            # Direct substring matches in name or description are always kept
            if val_lower in p_name_lower or val_lower in p_desc_lower:
                pks.append(p.pk)
            # Fuzzy word-level match for query typos
            elif len(val_lower) >= 2 and any(Levenshtein.distance(val_lower, w) <= 1 for w in p_name_lower.split()):
                pks.append(p.pk)
        return queryset.filter(pk__in=pks) if pks else queryset.none()

    def filter_in_stock(self, queryset, name, value):
        """
        Boolean stock filter.
        - true  -> quantity_in_stock > 0
        - false -> quantity_in_stock <= 0
        """
        if value is None:
            return queryset
        return queryset.filter(quantity_in_stock__gt=0) if value else queryset.filter(quantity_in_stock__lte=0)

    def filter_discounted(self, queryset, name, value):
        """
        Boolean discount filter.
        - true  -> original_price > price
        - false -> original_price is null OR original_price <= price
        """
        if value is None:
            return queryset
        discounted_q = Q(original_price__isnull=False) & Q(original_price__gt=0) & Q(original_price__gt=F("price"))
        return queryset.filter(discounted_q) if value else queryset.exclude(discounted_q)

    def _with_discount_percent(self, queryset):
        """
        Annotate discount_percent as a float number in range [0..100].
        Only meaningful when original_price > 0.
        """
        return queryset.annotate(
            discount_percent=ExpressionWrapper(
                (1.0 - (Cast(F("price"), FloatField()) / Cast(F("original_price"), FloatField()))) * 100.0,
                output_field=FloatField(),
            )
        )

    def filter_discount_percent_min(self, queryset, name, value):
        if value is None:
            return queryset
        qs = self.filter_discounted(queryset, "discounted", True)
        return self._with_discount_percent(qs).filter(discount_percent__gte=float(value))

    def filter_discount_percent_max(self, queryset, name, value):
        if value is None:
            return queryset
        qs = self.filter_discounted(queryset, "discounted", True)
        return self._with_discount_percent(qs).filter(discount_percent__lte=float(value))
