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
    ProductImage,
    ProductDosage,
    ProductReview,
    ProductReviewImage,
    Order,
    OrderItem,
    Cart,
    CartItem,
    Coupon,
    Prescription,
    PrescriptionItem,
    Consultation,
    Page,
    SidebarCategory,
    Ad,
    Combo,
    AppLogo,
)
from .validators import validate_prescription_file, validate_issue_date_not_older_than_six_months


# ---- Category (hierarchy: parent / children) ----
class CategorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "parent", "name", "slug", "image", "image_url", "is_active", "created_at", "updated_at")
        read_only_fields = ("id", "slug", "image_url", "created_at", "updated_at")

    def get_image_url(self, obj):
        if obj.image and self.context.get("request"):
            return self.context["request"].build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


class CategoryTreeSerializer(serializers.ModelSerializer):
    """Category with nested children for hierarchy (PRODUCT CATALOG > MEDICINES, SUPPLEMENTS, DEVICES)."""
    children = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "parent", "name", "slug", "image", "image_url", "is_active", "children", "created_at", "updated_at")

    def get_image_url(self, obj):
        if obj.image and self.context.get("request"):
            return self.context["request"].build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None

    def get_children(self, obj):
        children = obj.children.filter(is_active=True).order_by("name")
        return CategoryTreeSerializer(children, many=True, context=self.context).data


# ---- Sidebar category (left sidebar: image + title) ----
class SidebarCategorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = SidebarCategory
        fields = ("id", "image", "image_url", "title")
        read_only_fields = ("id", "image_url")

    def get_image_url(self, obj):
        if obj.image and self.context.get("request"):
            return self.context["request"].build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


# ---- App logo (slug + image) ----
class AppLogoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = AppLogo
        fields = ("id", "slug", "image", "image_url", "created_at", "updated_at")
        read_only_fields = ("id", "image_url", "created_at", "updated_at")

    def get_image_url(self, obj):
        if obj.image and self.context.get("request"):
            return self.context["request"].build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


# ---- Ad (banner: image + link) ----
class AdSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Ad
        fields = ("id", "image", "image_url", "link", "order", "is_active", "created_at", "updated_at")
        read_only_fields = ("id", "image_url", "created_at", "updated_at")

    def get_image_url(self, obj):
        if obj.image and self.context.get("request"):
            return self.context["request"].build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


# ---- Combo (combo packages: image + price + link) ----
class ComboSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Combo
        fields = (
            "id",
            "title",
            "description",
            "image",
            "image_url",
            "link",
            "price",
            "original_price",
            "bg_color",
            "order",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "image_url", "created_at", "updated_at")

    def get_image_url(self, obj):
        if obj.image and self.context.get("request"):
            return self.context["request"].build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


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
def _product_image_urls(product, request=None):
    """Return list of absolute image URLs for product.images (ordered)."""
    urls = []
    for img in product.images.all():
        if img.image:
            url = img.image.url
            if request:
                url = request.build_absolute_uri(url)
            urls.append(url)
    return urls


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True, allow_null=True)
    ingredient_name = serializers.CharField(source="ingredient.name", read_only=True, allow_null=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True, allow_null=True)
    images = serializers.SerializerMethodField()
    dosages = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "category", "category_name", "brand", "brand_name",
            "ingredient", "ingredient_name", "requires_prescription",
            "price", "original_price", "discount_percentage", "image",
            "images",
            "unit_label", "dosage", "dosages",
            "rating_avg", "review_count",
            "quantity_in_stock", "low_stock_threshold", "is_low_stock", "is_active",
            "created_at", "updated_at",
        )

    def get_images(self, obj):
        return _product_image_urls(obj, self.context.get("request"))

    def get_dosages(self, obj):
        if hasattr(obj, "dosage_options"):
            return [d.dosage_label for d in obj.dosage_options.all()]
        return []


class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True, allow_null=True)
    ingredient_name = serializers.CharField(source="ingredient.name", read_only=True, allow_null=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True, allow_null=True)
    images = serializers.SerializerMethodField()
    dosages = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "category", "category_name", "brand", "brand_name",
            "ingredient", "ingredient_name", "requires_prescription",
            "description", "price", "original_price", "discount_percentage", "image",
            "images",
            "unit_label", "dosage", "dosages",
            "rating_avg", "review_count",
            "key_benefits", "specifications",
            "quantity_in_stock", "low_stock_threshold", "is_low_stock", "is_active",
            "created_at", "updated_at",
        )

    def get_images(self, obj):
        return _product_image_urls(obj, self.context.get("request"))

    def get_dosages(self, obj):
        if hasattr(obj, "dosage_options"):
            return [d.dosage_label for d in obj.dosage_options.all()]
        return []


class ProductWriteSerializer(serializers.ModelSerializer):
    dosages = serializers.ListField(
        child=serializers.CharField(max_length=50, allow_blank=False),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="Optional list of dosage labels (e.g. ['50mg', '500mg']). Replaces existing dosage options.",
    )

    class Meta:
        model = Product
        fields = (
            "name", "slug", "category", "brand", "ingredient", "requires_prescription",
            "description", "price", "original_price", "image",
            "unit_label", "dosage",
            "rating_avg", "review_count",
            "key_benefits", "specifications",
            "quantity_in_stock", "low_stock_threshold", "is_active",
            "dosages",
        )
        extra_kwargs = {"slug": {"required": False}}

    def create(self, validated_data):
        dosages = validated_data.pop("dosages", None)
        product = super().create(validated_data)
        if dosages is not None:
            ProductDosage.objects.filter(product=product).delete()
            for i, label in enumerate(dosages):
                label = (label or "").strip()
                if label:
                    ProductDosage.objects.create(product=product, dosage_label=label, order=i)
        return product

    def update(self, instance, validated_data):
        dosages = validated_data.pop("dosages", None)
        product = super().update(instance, validated_data)
        if dosages is not None:
            ProductDosage.objects.filter(product=product).delete()
            for i, label in enumerate(dosages):
                label = (label or "").strip()
                if label:
                    ProductDosage.objects.create(product=product, dosage_label=label, order=i)
        return product


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ("id", "image", "image_url", "order", "created_at")
        read_only_fields = ("id", "created_at")

    def get_image_url(self, obj):
        if obj.image and self.context.get("request"):
            return self.context["request"].build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


class ProductImageCreateSerializer(serializers.Serializer):
    image = serializers.ImageField(required=True)
    order = serializers.IntegerField(default=0, min_value=0)


class ProductDosageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductDosage
        fields = ("id", "dosage_label", "order")
        read_only_fields = ("id",)


class ProductDosageCreateSerializer(serializers.Serializer):
    dosage_label = serializers.CharField(max_length=50, trim_whitespace=True)
    order = serializers.IntegerField(default=0, min_value=0, required=False)


# ---- Product review (rating + comment + images) ----
class ProductReviewImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductReviewImage
        fields = ("id", "image", "image_url", "order", "created_at")
        read_only_fields = ("id", "image_url", "created_at")

    def get_image_url(self, obj):
        if obj.image and self.context.get("request"):
            return self.context["request"].build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


class ProductReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    images = ProductReviewImageSerializer(many=True, read_only=True)

    class Meta:
        model = ProductReview
        fields = ("id", "product", "user", "user_name", "rating", "title", "comment", "images", "created_at", "updated_at")
        read_only_fields = ("id", "user", "created_at", "updated_at")


class ProductReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductReview
        fields = ("product", "rating", "title", "comment")

    def validate_rating(self, value):
        if value is None or value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate(self, attrs):
        user = self.context["request"].user
        product = attrs["product"]
        # Must have purchased the product (at least one delivered order containing this product)
        from .models import Order
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            order__status=Order.Status.DELIVERED,
            product=product,
        ).exists()
        if not has_purchased:
            raise serializers.ValidationError(
                {"product": "You can only review products you have purchased (delivered orders)."}
            )
        # One review per user per product
        if ProductReview.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError(
                {"product": "You have already reviewed this product. Update or delete your existing review."}
            )
        return attrs

    def create(self, validated_data):
        user = validated_data.pop("user", None) or self.context["request"].user
        return ProductReview.objects.create(user=user, **validated_data)


class InventoryProductSerializer(serializers.ModelSerializer):
    """Product fields for pharmacy inventory list: stock and threshold."""
    is_low_stock = serializers.BooleanField(read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True, allow_null=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True, allow_null=True)

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "category", "category_name", "brand", "brand_name",
            "quantity_in_stock", "low_stock_threshold", "is_low_stock",
            "is_active", "updated_at",
        )


# ---- Order ----
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "product", "product_name", "quantity", "price_at_order", "dosage")


class OrderItemWriteSerializer(serializers.ModelSerializer):
    dosage = serializers.CharField(max_length=50, required=False, allow_blank=True)

    class Meta:
        model = OrderItem
        fields = ("product", "quantity", "dosage")


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
            dosage = (item_data.get("dosage") or "").strip()[:50]
            OrderItem.objects.create(order=order, product=product, quantity=quantity, price_at_order=price, dosage=dosage)
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


# ---- Cart ----
def _product_image_url(product, request=None):
    """Single image URL for product (primary image or first gallery image)."""
    if product.image:
        url = product.image.url
        if request:
            url = request.build_absolute_uri(url)
        return url
    for img in product.images.all()[:1]:
        if img.image:
            url = img.image.url
            if request:
                url = request.build_absolute_uri(url)
            return url
    return None


class CartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_slug = serializers.CharField(source="product.slug", read_only=True)
    product_description = serializers.CharField(source="product.description", read_only=True)
    product_original_price = serializers.DecimalField(source="product.original_price", max_digits=12, decimal_places=2, read_only=True, allow_null=True)
    product_unit_label = serializers.CharField(source="product.unit_label", read_only=True)
    product_dosage = serializers.CharField(source="product.dosage", read_only=True)
    image_url = serializers.SerializerMethodField()
    current_price = serializers.DecimalField(source="product.price", max_digits=12, decimal_places=2, read_only=True)
    quantity_in_stock = serializers.IntegerField(source="product.quantity_in_stock", read_only=True)

    class Meta:
        model = CartItem
        fields = (
            "id",
            "product",
            "product_id",
            "product_name",
            "product_slug",
            "product_description",
            "product_original_price",
            "product_unit_label",
            "product_dosage",
            "dosage",
            "image_url",
            "quantity",
            "price_at_order",
            "current_price",
            "quantity_in_stock",
        )
        read_only_fields = (
            "id",
            "price_at_order",
            "product_name",
            "product_slug",
            "product_description",
            "product_original_price",
            "product_unit_label",
            "product_dosage",
            "image_url",
            "current_price",
            "quantity_in_stock",
        )

    def get_image_url(self, obj):
        return _product_image_url(obj.product, self.context.get("request"))


class AddToCartSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.filter(is_active=True))
    quantity = serializers.IntegerField(min_value=1)
    dosage = serializers.CharField(max_length=50, required=False, allow_blank=True)

    def validate(self, attrs):
        product = attrs["product"]
        qty = attrs["quantity"]
        if qty > product.quantity_in_stock:
            raise serializers.ValidationError(
                {"quantity": f"Insufficient stock. Available: {product.quantity_in_stock}"}
            )
        return attrs


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0, required=False)
    dosage = serializers.CharField(max_length=50, required=False, allow_blank=True)


class CartSummarySerializer(serializers.Serializer):
    """Nested object for cart summary: subtotal, delivery_fee, discount_amount, total_payable."""
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2)
    delivery_fee = serializers.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_payable = serializers.DecimalField(max_digits=12, decimal_places=2)
    discount_display = serializers.CharField(allow_null=True, required=False)
    coupon_code = serializers.CharField(allow_null=True, required=False)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    summary = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ("id", "items", "summary", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    def get_summary(self, obj):
        from .services import get_cart_summary, validate_coupon, get_delivery_zone_for_district
        request = self.context.get("request")
        delivery_zone = None
        coupon = None
        if request:
            address_id = request.query_params.get("address_id") or request.data.get("address_id")
            if address_id:
                try:
                    from authentication.models import UserAddress
                    addr = UserAddress.objects.filter(user=request.user, pk=address_id).first()
                    if addr:
                        delivery_zone = get_delivery_zone_for_district(addr.district)
                except Exception:
                    pass
            code = request.query_params.get("coupon_code") or request.data.get("coupon_code")
            if code:
                items = obj.items.select_related("product").all()
                subtotal = sum((i.price_at_order * i.quantity for i in items), Decimal("0"))
                try:
                    coupon, _ = validate_coupon(code, subtotal)
                except ValueError:
                    pass
        data = get_cart_summary(obj, delivery_zone=delivery_zone, coupon=coupon)
        return data


class PlaceOrderFromCartSerializer(serializers.Serializer):
    shipping_address_id = serializers.IntegerField(required=True, help_text="UserAddress id for shipping")
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)


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
