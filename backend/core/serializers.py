"""
Serializers for core API: Category, Product, Order, Prescription, Consultation, Page.
"""
from decimal import Decimal
from rest_framework import serializers

from .models import (
    Brand,
    Category,
    Ingredient,
    Product,
    Order,
    OrderItem,
    Prescription,
    PrescriptionItem,
    Consultation,
    Page,
)
from .validators import validate_prescription_file, validate_issue_date_not_older_than_six_months


# ---- Category (hierarchy: parent / children) ----
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "parent", "name", "slug", "is_active", "created_at", "updated_at")
        read_only_fields = ("id", "slug", "created_at", "updated_at")


class CategoryTreeSerializer(serializers.ModelSerializer):
    """Category with nested children for hierarchy (PRODUCT CATALOG > MEDICINES, SUPPLEMENTS, DEVICES)."""
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "parent", "name", "slug", "is_active", "children", "created_at", "updated_at")

    def get_children(self, obj):
        children = obj.children.filter(is_active=True).order_by("name")
        return CategoryTreeSerializer(children, many=True, context=self.context).data


# ---- Brand (autocomplete) ----
class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "name", "slug", "is_active", "created_at", "updated_at")
        read_only_fields = ("id", "slug", "created_at", "updated_at")


# ---- Ingredient (generic search) ----
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ("id", "name", "slug", "created_at", "updated_at")
        read_only_fields = ("id", "slug", "created_at", "updated_at")


# ---- Product ----
class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True, allow_null=True)
    ingredient_name = serializers.CharField(source="ingredient.name", read_only=True, allow_null=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "category", "category_name", "brand", "brand_name",
            "ingredient", "ingredient_name", "requires_prescription", "price", "image",
            "quantity_in_stock", "low_stock_threshold", "is_low_stock", "is_active",
            "created_at", "updated_at",
        )


class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True, allow_null=True)
    ingredient_name = serializers.CharField(source="ingredient.name", read_only=True, allow_null=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "category", "category_name", "brand", "brand_name",
            "ingredient", "ingredient_name", "requires_prescription", "description", "price", "image",
            "quantity_in_stock", "low_stock_threshold", "is_low_stock", "is_active",
            "created_at", "updated_at",
        )


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            "name", "slug", "category", "brand", "ingredient", "requires_prescription",
            "description", "price", "image",
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
            "id", "user", "user_email", "user_username", "prescription", "status", "total",
            "shipping_address", "notes", "items", "created_at", "updated_at",
        )
        read_only_fields = ("id", "total", "created_at", "updated_at")


class OrderWriteSerializer(serializers.ModelSerializer):
    items = OrderItemWriteSerializer(many=True)
    prescription = serializers.PrimaryKeyRelatedField(
        queryset=Prescription.objects.none(),
        required=False,
        allow_null=True,
        help_text="Required when order contains prescription-only medicines; must be APPROVED and owned by you.",
    )

    class Meta:
        model = Order
        fields = ("shipping_address", "notes", "items", "prescription")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if "request" in self.context:
            self.fields["prescription"].queryset = Prescription.objects.filter(
                user=self.context["request"].user,
                status=Prescription.Status.APPROVED,
            )

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        prescription = validated_data.pop("prescription", None)
        user = self.context["request"].user

        # If any product requires prescription, prescription is required and must be APPROVED
        products = [item["product"] for item in items_data]
        prescription_products = [p for p in products if p.requires_prescription]
        if prescription_products and not prescription:
            raise serializers.ValidationError(
                {"prescription": "Required when ordering prescription-only medicines. Upload and get approval first."}
            )
        if prescription and prescription_products:
            if prescription.user_id != user.id:
                raise serializers.ValidationError({"prescription": "You can only use your own approved prescription."})
            if prescription.status != Prescription.Status.APPROVED:
                raise serializers.ValidationError({"prescription": "Prescription must be in APPROVED status."})
            # Medicine match & quantity limit: ordered medicines must be on prescription; quantity cannot exceed prescribed
            rx_items = {pi.product_id: pi.quantity_prescribed for pi in prescription.items.select_related("product").all()}
            for item_data in items_data:
                product = item_data["product"]
                quantity = item_data["quantity"]
                if product.requires_prescription:
                    if product.id not in rx_items:
                        raise serializers.ValidationError(
                            {f"product {product.id}": f"{product.name} must be listed on the prescription."}
                        )
                    if quantity > rx_items[product.id]:
                        raise serializers.ValidationError(
                            {f"product {product.id}": f"Cannot exceed prescribed quantity ({rx_items[product.id]})."}
                        )

        order = Order.objects.create(user=user, status=Order.Status.PENDING, prescription=prescription, **validated_data)
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

        if prescription and prescription.status == Prescription.Status.APPROVED:
            prescription.status = Prescription.Status.USED
            prescription.save(update_fields=["status"])

        return order


class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ("status",)


# ---- Prescription ----
class PrescriptionItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = PrescriptionItem
        fields = ("id", "product", "product_name", "quantity_prescribed")


class PrescriptionSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    items = PrescriptionItemSerializer(many=True, read_only=True)

    class Meta:
        model = Prescription
        fields = (
            "id", "user", "user_email", "image", "file", "status", "issue_date",
            "patient_name_on_rx", "doctor_name", "doctor_reg_number", "has_signature",
            "verified_by", "verified_at", "notes", "items", "created_at",
        )
        read_only_fields = ("id", "status", "verified_by", "verified_at", "created_at")


class PrescriptionUploadSerializer(serializers.ModelSerializer):
    """Upload: file (JPG/PNG/PDF, max 10MB); optional issue_date, patient_name_on_rx, doctor_name, doctor_reg_number."""

    class Meta:
        model = Prescription
        fields = ("file", "issue_date", "patient_name_on_rx", "doctor_name", "doctor_reg_number")
        extra_kwargs = {"file": {"required": True}}

    def validate_file(self, value):
        if not value:
            raise serializers.ValidationError("File is required. Allowed: JPG, PNG, PDF; max 10MB.")
        validate_prescription_file(value)
        return value

    def validate_issue_date(self, value):
        if value is not None:
            validate_issue_date_not_older_than_six_months(value)
        return value


class PrescriptionVerifySerializer(serializers.ModelSerializer):
    """Verify: PENDING -> APPROVED or REJECTED. When APPROVED: doctor_name, doctor_reg_number, has_signature required; items list."""
    items = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="List of {product: id, quantity_prescribed: int} when approving.",
    )

    class Meta:
        model = Prescription
        fields = ("status", "notes", "doctor_name", "doctor_reg_number", "has_signature", "patient_name_on_rx", "items")

    def validate_status(self, value):
        if value not in (Prescription.Status.APPROVED, Prescription.Status.REJECTED):
            raise serializers.ValidationError("Status must be APPROVED or REJECTED.")
        return value

    def validate(self, attrs):
        instance = self.instance
        if instance and instance.status != Prescription.Status.PENDING:
            raise serializers.ValidationError(
                {"status": "Only prescriptions in PENDING status can be approved or rejected."}
            )
        status = attrs.get("status")
        if status == Prescription.Status.APPROVED:
            if not attrs.get("doctor_name", instance.doctor_name if instance else ""):
                raise serializers.ValidationError({"doctor_name": "Required when approving (doctor details)."})
            if not attrs.get("doctor_reg_number", instance.doctor_reg_number if instance else ""):
                raise serializers.ValidationError({"doctor_reg_number": "Required when approving (doctor registration number)."})
            if not attrs.get("has_signature", instance.has_signature if instance else False):
                raise serializers.ValidationError({"has_signature": "Must be true when approving (signature required)."})
        return attrs


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
