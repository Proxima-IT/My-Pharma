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
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent", "is_active", "created_at")
    list_filter = ("is_active", "parent")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    raw_id_fields = ("parent",)


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
    raw_id_fields = ("category", "brand", "ingredient")
    list_editable = ("is_active", "quantity_in_stock")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    raw_id_fields = ("product",)


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
