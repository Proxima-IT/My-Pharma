"""
Product catalog filters: name (fuzzy), brand, ingredient (generic), price range, requires_prescription.
Aligned with PRODUCT_CATALOG.md search & filter logic.
"""
from django.db.models import Q
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
    # Availability (stock)
    available = BooleanFilter(method="filter_in_stock")
    in_stock = BooleanFilter(method="filter_in_stock")
    ordering = OrderingFilter(
        fields=(("price", "price"), ("name", "name"), ("created_at", "created_at")),
        field_labels={"price": "Price", "name": "Name", "created_at": "Created"},
    )

    class Meta:
        model = Product
        fields = ["is_active", "brand_id", "ingredient_id", "requires_prescription"]

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
        if not candidate_pks:
            return queryset.none()
        # Run Levenshtein on a separate minimal queryset (no select_related) to avoid conflict.
        pks = []
        for p in Product.objects.filter(pk__in=candidate_pks).only("pk", "name").iterator():
            if Levenshtein.distance(value.lower(), p.name.lower()) <= 2:
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
