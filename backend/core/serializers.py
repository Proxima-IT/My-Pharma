"""
Serializers for core API: Category, Product, Order, Prescription, Consultation, Page.
"""
from decimal import Decimal
from rest_framework import serializers

from .models import Category, Product, Order, OrderItem, Prescription, Consultation, Page


# ---- Category ----
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "is_active", "created_at", "updated_at")
        read_only_fields = ("id", "slug", "created_at", "updated_at")


# ---- Product ----
class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "category", "category_name", "price", "image",
            "quantity_in_stock", "low_stock_threshold", "is_low_stock", "is_active",
            "created_at", "updated_at",
        )


class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "category", "category_name", "description", "price", "image",
            "quantity_in_stock", "low_stock_threshold", "is_low_stock", "is_active",
            "created_at", "updated_at",
        )


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            "name", "slug", "category", "description", "price", "image",
            "quantity_in_stock", "low_stock_threshold", "is_active",
        )
        extra_kwargs = {"slug": {"required": False}}


# ---- Order ----
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "product", "product_name", "quantity", "price_at_order")


class OrderItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ("product", "quantity")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Order
        fields = (
            "id", "user", "user_email", "user_username", "status", "total",
            "shipping_address", "notes", "items", "created_at", "updated_at",
        )
        read_only_fields = ("id", "total", "created_at", "updated_at")


class OrderWriteSerializer(serializers.ModelSerializer):
    items = OrderItemWriteSerializer(many=True)

    class Meta:
        model = Order
        fields = ("shipping_address", "notes", "items")

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        user = self.context["request"].user
        order = Order.objects.create(user=user, status=Order.Status.PENDING, **validated_data)
        total = Decimal("0")
        for item_data in items_data:
            product = item_data["product"]
            quantity = item_data["quantity"]
            if product.quantity_in_stock < quantity:
                raise serializers.ValidationError(
                    {f"product {product.id}": f"Insufficient stock. Available: {product.quantity_in_stock}"}
                )
            price = product.price
            OrderItem.objects.create(order=order, product=product, quantity=quantity, price_at_order=price)
            total += price * quantity
            product.quantity_in_stock -= quantity
            product.save(update_fields=["quantity_in_stock"])
        order.total = total
        order.save(update_fields=["total"])
        return order


class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ("status",)


# ---- Prescription ----
class PrescriptionSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = Prescription
        fields = (
            "id", "user", "user_email", "image", "status", "verified_by", "verified_at",
            "notes", "created_at",
        )
        read_only_fields = ("id", "status", "verified_by", "verified_at", "created_at")


class PrescriptionUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = ("image",)


class PrescriptionVerifySerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = ("status", "notes")


# ---- Consultation ----
class ConsultationSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    doctor_email = serializers.CharField(source="doctor.email", read_only=True, allow_null=True)

    class Meta:
        model = Consultation
        fields = (
            "id", "user", "user_email", "doctor", "doctor_email", "subject", "message",
            "response", "status", "created_at", "updated_at",
        )
        read_only_fields = ("id", "user", "doctor", "response", "created_at", "updated_at")


class ConsultationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = ("subject", "message")


class ConsultationResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = ("response", "status")


# ---- Page (CMS) ----
class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ("id", "slug", "title", "content", "is_published", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")
