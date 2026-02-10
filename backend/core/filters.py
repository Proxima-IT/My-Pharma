"""
Product catalog filters: name (fuzzy), brand, ingredient (generic), price range, requires_prescription.
Aligned with PRODUCT_CATALOG.md search & filter logic.
"""
from django.db.models import Q
from django_filters import BooleanFilter, CharFilter, FilterSet, NumberFilter, OrderingFilter

from .models import Product


class ProductFilter(FilterSet):
    """Search & filter for product list. Query params: search, brand_id, ingredient_id, price_min, price_max, requires_prescription, ordering."""
    search = CharFilter(method="filter_search", label="Name search (fuzzy Levenshtein <= 2)")
    brand_id = NumberFilter(field_name="brand_id", lookup_expr="exact")
    ingredient_id = NumberFilter(field_name="ingredient_id", lookup_expr="exact")
    price_min = NumberFilter(field_name="price", lookup_expr="gte")
    price_max = NumberFilter(field_name="price", lookup_expr="lte")
    requires_prescription = BooleanFilter(field_name="requires_prescription")
    ordering = OrderingFilter(
        fields=(("price", "price"), ("name", "name"), ("created_at", "created_at")),
        field_labels={"price": "Price", "name": "Name", "created_at": "Created"},
    )

    class Meta:
        model = Product
        fields = ["category", "is_active", "brand_id", "ingredient_id", "requires_prescription"]

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
        candidates = queryset.filter(Q(name__icontains=value) | Q(description__icontains=value))
        pks = []
        for p in candidates.only("pk", "name").iterator():
            if Levenshtein.distance(value.lower(), p.name.lower()) <= 2:
                pks.append(p.pk)
        return queryset.filter(pk__in=pks) if pks else queryset.none()
