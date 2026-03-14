"""
Admin for core models: Category, Brand, Ingredient, Product, Order, OrderItem,
Prescription, PrescriptionItem, Consultation, Page.
"""
from django.contrib import admin

from .models import (
    Brand,
    Category,
    Consultation,
    Ingredient,
    Order,
    OrderItem,
    Page,
    Prescription,
    PrescriptionItem,
    Product,
    ProductImage,
    ProductDosage,
    ProductReview,
    ProductReviewImage,
    Cart,
    CartItem,
    Coupon,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent", "is_active", "created_at")
    list_filter = ("is_active", "parent")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    list_select_related = ("parent",)


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image", "order")


class ProductDosageInline(admin.TabularInline):
    model = ProductDosage
    extra = 1
    fields = ("dosage_label", "order")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "slug",
        "category",
        "brand",
        "price",
        "quantity_in_stock",
        "requires_prescription",
        "is_active",
        "created_at",
    )
    list_filter = ("is_active", "requires_prescription", "category", "brand")
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}
    list_select_related = ("category", "brand", "ingredient")
    list_editable = ("is_active", "quantity_in_stock")
    inlines = [ProductImageInline, ProductDosageInline]


class ProductReviewImageInline(admin.TabularInline):
    model = ProductReviewImage
    extra = 0
    fields = ("image", "order")


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "user", "rating", "title", "created_at")
    list_filter = ("rating",)
    search_fields = ("user__username", "user__email", "product__name", "title", "comment")
    raw_id_fields = ("user", "product")
    inlines = [ProductReviewImageInline]
    date_hierarchy = "created_at"


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    raw_id_fields = ("product",)
    fields = ("product", "quantity", "price_at_order", "dosage")


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    raw_id_fields = ("product",)
    fields = ("product", "quantity", "price_at_order", "dosage")


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "updated_at")
    raw_id_fields = ("user",)
    inlines = [CartItemInline]


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "discount_type",
        "discount_value",
        "min_order_amount",
        "times_used",
        "max_uses",
        "is_active",
        "valid_from",
        "valid_until",
    )
    list_filter = ("discount_type", "is_active")
    search_fields = ("code",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "total", "created_at")
    list_filter = ("status",)
    search_fields = ("user__email", "user__phone", "id")
    raw_id_fields = ("user", "prescription")
    inlines = [OrderItemInline]
    date_hierarchy = "created_at"


class PrescriptionItemInline(admin.TabularInline):
    model = PrescriptionItem
    extra = 0
    raw_id_fields = ("product",)


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "patient_name_on_rx", "created_at")
    list_filter = ("status",)
    search_fields = ("user__email", "user__phone", "patient_name_on_rx", "doctor_name")
    raw_id_fields = ("user", "verified_by")
    inlines = [PrescriptionItemInline]
    date_hierarchy = "created_at"


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "doctor", "subject", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("user__email", "subject", "message")
    raw_id_fields = ("user", "doctor")
    date_hierarchy = "created_at"


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "is_published", "created_at")
    list_filter = ("is_published",)
    search_fields = ("title", "slug", "content")
    prepopulated_fields = {"slug": ("title",)}
