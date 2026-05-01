"""
Serializers for core API: Category, Product, Order, Prescription, Consultation,
Notifications, Blog, Page.
"""
from decimal import Decimal
from zoneinfo import ZoneInfo

from django.utils import timezone
from rest_framework import serializers

from .models import (
    Brand,
    Category,
    DeliveryDuration,
    Ingredient,
    Unit,
    Product,
    ProductImage,
    ProductDosage,
    ProductReview,
    ProductReviewImage,
    Order,
    OrderImage,
    OrderItem,
    OrderStatusHistory,
    Cart,
    CartItem,
    Coupon,
    Prescription,
    PrescriptionImage,
    PrescriptionItem,
    PrescriptionStatusHistory,
    Consultation,
    NotificationCampaign,
    NotificationDeliveryLog,
    UserNotification,
    UserNotificationPreference,
    UserPushSubscription,
    BlogCategory,
    BlogPost,
    OrderSettlement,
    PaymentTransaction,
    B2BCustomerProfile,
    B2BCommissionEntry,
    Page,
    SidebarCategory,
    Ad,
    Combo,
    AppLogo,
)
from .validators import validate_prescription_file, validate_issue_date_not_older_than_six_months

# For PrescriptionUploadSerializer.shipping_address default queryset (overridden in __init__ when request in context)
from authentication.models import UserAddress


# ---- Category (hierarchy: parent / children) ----
class CategorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    sidebar_category_title = serializers.CharField(
        source="sidebar_category.title",
        read_only=True,
        allow_null=True,
    )
    is_home_categoery = serializers.BooleanField(source="is_featured_home", required=False)

    class Meta:
        model = Category
        fields = (
            "id",
            "parent",
            "sidebar_category",
            "sidebar_category_title",
            "name",
            "slug",
            "image",
            "image_url",
            "is_active",
            "show_in_sidebar",
            "sidebar_order",
            "is_featured_home",
            "is_home_categoery",
            "featured_order",
            "product_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "image_url", "product_count", "created_at", "updated_at")

    def get_image_url(self, obj):
        if obj.image and self.context.get("request"):
            return self.context["request"].build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None

    def get_product_count(self, obj):
        if hasattr(obj, "product_count") and obj.product_count is not None:
            return obj.product_count
        return obj.products.filter(is_active=True).count()

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        sidebar_category = attrs.get(
            "sidebar_category",
            getattr(instance, "sidebar_category", None),
        )
        show_in_sidebar = attrs.get(
            "show_in_sidebar",
            getattr(instance, "show_in_sidebar", False),
        )
        if sidebar_category and not show_in_sidebar:
            attrs["show_in_sidebar"] = True
        return attrs


class CategoryTreeSerializer(serializers.ModelSerializer):
    """Category with nested children for hierarchy (PRODUCT CATALOG > MEDICINES, SUPPLEMENTS, DEVICES)."""
    children = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    is_home_categoery = serializers.BooleanField(source="is_featured_home", required=False)

    class Meta:
        model = Category
        fields = (
            "id",
            "parent",
            "sidebar_category",
            "name",
            "slug",
            "image",
            "image_url",
            "is_active",
            "show_in_sidebar",
            "sidebar_order",
            "is_featured_home",
            "is_home_categoery",
            "featured_order",
            "product_count",
            "children",
            "created_at",
            "updated_at",
        )

    def get_image_url(self, obj):
        if obj.image and self.context.get("request"):
            return self.context["request"].build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None

    def get_product_count(self, obj):
        if hasattr(obj, "product_count") and obj.product_count is not None:
            return obj.product_count
        return obj.products.filter(is_active=True).count()

    def get_children(self, obj):
        children = obj.children.filter(is_active=True).order_by("name")
        return CategoryTreeSerializer(children, many=True, context=self.context).data


class CategoryMenuSerializer(serializers.ModelSerializer):
    """Compact category payload for sidebar and featured home sections."""
    image_url = serializers.SerializerMethodField()
    title = serializers.CharField(source="name", read_only=True)
    quantity = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            "id",
            "sidebar_category",
            "name",
            "title",
            "slug",
            "image",
            "image_url",
            "quantity",
            "sidebar_order",
            "featured_order",
        )
        read_only_fields = fields

    def get_image_url(self, obj):
        if obj.image and self.context.get("request"):
            return self.context["request"].build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None

    def get_quantity(self, obj):
        if hasattr(obj, "product_count") and obj.product_count is not None:
            return obj.product_count
        return obj.products.filter(is_active=True).count()


class CategorySelectionUpdateSerializer(serializers.Serializer):
    """Exact selection list for sidebar/featured category menus."""
    category_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=True,
        help_text="Ordered category ids. Existing selections not included here will be unset.",
    )

    def validate_category_ids(self, value):
        deduped = []
        seen = set()
        for category_id in value:
            if category_id not in seen:
                seen.add(category_id)
                deduped.append(category_id)
        existing_ids = set(
            Category.objects.filter(id__in=deduped).values_list("id", flat=True)
        )
        missing_ids = [cid for cid in deduped if cid not in existing_ids]
        if missing_ids:
            raise serializers.ValidationError(f"Category not found for ids: {missing_ids}")
        return deduped


class ProductLinkCategorySerializer(serializers.Serializer):
    """Assign a specific category to a product."""
    category_id = serializers.IntegerField(
        min_value=1,
        help_text="ID of the category to link to this product.",
    )
    is_home_page_category = serializers.BooleanField(
        required=False,
        default=False,
        help_text="Whether this product should be featured on the homepage.",
    )

    def validate_category_id(self, value):
        from .models import Category
        if not Category.objects.filter(id=value).exists():
            raise serializers.ValidationError(f"Category not found for id: {value}")
        return value


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


# ---- Unit (medicine packaging) ----
class UnitSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Unit
        fields = ("id", "unit_type", "content_type", "quantity", "name", "slug", "is_active", "created_at", "updated_at")
        read_only_fields = ("id", "name", "slug", "created_at", "updated_at")

    def get_name(self, obj):
        return obj.name


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
    unit_name = serializers.SerializerMethodField()
    is_low_stock = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True, allow_null=True)
    images = serializers.SerializerMethodField()
    dosages = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "category", "category_name", "brand", "brand_name",
            "ingredient", "ingredient_name", "requires_prescription", "is_generic",
            "price", "original_price", "discount_percentage", "image",
            "images",
            "unit", "unit_name", "dosage", "dosages",
            "rating_avg", "review_count",
            "quantity_in_stock", "low_stock_threshold", "is_low_stock", "is_active",
            "is_in_homepage", "created_at", "updated_at",
        )

    def get_unit_name(self, obj):
        return obj.unit.name if obj.unit else None

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
    unit_name = serializers.SerializerMethodField()
    is_low_stock = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True, allow_null=True)
    images = serializers.SerializerMethodField()
    dosages = serializers.SerializerMethodField()
    generic_alternatives = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "category", "category_name", "brand", "brand_name",
            "ingredient", "ingredient_name", "requires_prescription", "is_generic",
            "description", "price", "original_price", "discount_percentage", "image",
            "images",
            "unit", "unit_name", "dosage", "dosages",
            "rating_avg", "review_count",
            "key_benefits", "specifications",
            "indications", "therapeutic_class", "pharmacology", "dosage_administration",
            "interaction", "contraindications", "side_effects", "pregnancy_lactation",
            "precautions_warnings", "overdose_effects", "storage_conditions", "mode_of_action",
            "drug_classes", "pregnancy", "alternative_products", "faq",
            "quantity_in_stock", "low_stock_threshold", "is_low_stock", "is_active",
            "is_in_homepage", "generic_alternatives",
            "created_at", "updated_at",
        )

    def get_unit_name(self, obj):
        return obj.unit.name if obj.unit else None

    def get_images(self, obj):
        return _product_image_urls(obj, self.context.get("request"))

    def get_dosages(self, obj):
        if hasattr(obj, "dosage_options"):
            return [d.dosage_label for d in obj.dosage_options.all()]
        return []

    def get_generic_alternatives(self, obj):
        """Other in-catalog generic products with the same active ingredient (and strength when possible)."""
        if not obj.ingredient_id:
            return []
        base = (
            Product.objects.filter(
                ingredient_id=obj.ingredient_id,
                is_generic=True,
                is_active=True,
            )
            .exclude(pk=obj.pk)
            .select_related("category", "brand", "ingredient")
            .prefetch_related("images", "dosage_options")
        )
        dosage = (obj.dosage or "").strip()
        if dosage:
            matched = base.filter(dosage__iexact=dosage)
            qs = matched if matched.exists() else base
        else:
            qs = base
        qs = qs.order_by("price", "name")[:12]
        return ProductListSerializer(qs, many=True, context=self.context).data


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
            "name", "slug", "category", "brand", "ingredient", "requires_prescription", "is_generic",
            "description", "price", "original_price", "image",
            "unit", "dosage",
            "rating_avg", "review_count",
            "key_benefits", "specifications",
            "indications", "therapeutic_class", "pharmacology", "dosage_administration",
            "interaction", "contraindications", "side_effects", "pregnancy_lactation",
            "precautions_warnings", "overdose_effects", "storage_conditions", "mode_of_action",
            "drug_classes", "pregnancy", "alternative_products", "faq",
            "quantity_in_stock", "low_stock_threshold", "is_active", "is_in_homepage",
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


class OrderImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = OrderImage
        fields = ("id", "image", "image_url", "order_display")

    def get_image_url(self, obj):
        if obj.image and self.context.get("request"):
            return self.context["request"].build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


# Bangladesh timezone for order status timeline
BD_TZ = ZoneInfo("Asia/Dhaka")


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    """Status timeline entry; date/time in Bangladeshi time (Asia/Dhaka)."""
    created_at_bd = serializers.SerializerMethodField()
    date_bd = serializers.SerializerMethodField()
    time_bd = serializers.SerializerMethodField()

    class Meta:
        model = OrderStatusHistory
        fields = ("id", "status", "created_at", "created_at_bd", "date_bd", "time_bd")

    def _bd_datetime(self, obj):
        dt = obj.created_at
        if timezone.is_naive(dt):
            dt = timezone.make_aware(dt)
        return dt.astimezone(BD_TZ)

    def get_created_at_bd(self, obj):
        return self._bd_datetime(obj).strftime("%Y-%m-%d %H:%M:%S %Z")

    def get_date_bd(self, obj):
        return self._bd_datetime(obj).strftime("%Y-%m-%d")

    def get_time_bd(self, obj):
        return self._bd_datetime(obj).strftime("%H:%M:%S")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    images = OrderImageSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_username = serializers.CharField(source="user.username", read_only=True)
    duration_name = serializers.CharField(source="duration.name", read_only=True, allow_null=True)
    duration_days = serializers.IntegerField(source="duration.days", read_only=True, allow_null=True)
    # Payment info from related OrderSettlement
    payment_status = serializers.CharField(source="settlement.payment_status", read_only=True, default="PENDING")
    payment_method = serializers.CharField(source="settlement.payment_method", read_only=True, default="COD")

    class Meta:
        model = Order
        fields = (
            "id", "user", "user_email", "user_username", "prescription", "duration", "duration_name", "duration_days",
            "status",
            "payment_status",
            "payment_method",
            "subtotal_before_discount",
            "discount_amount",
            "delivery_fee",
            "coupon",
            "total",
            "shipping_address",
            "notes",
            "message",
            "items",
            "images",
            "status_history",
            "created_at", "updated_at",
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
    duration = serializers.PrimaryKeyRelatedField(
        queryset=DeliveryDuration.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Order
        fields = ("shipping_address", "notes", "message", "items", "prescription", "duration")

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

        order = Order.objects.create(
            user=user,
            status=Order.Status.PENDING,
            prescription=prescription,
            duration=validated_data.pop("duration", None),
            **validated_data,
        )
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
    """Admin PATCH: status and/or duration."""
    duration = serializers.PrimaryKeyRelatedField(
        queryset=DeliveryDuration.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Order
        fields = ("status", "duration")


# ---- Delivery duration (admin CRUD) ----
class DeliveryDurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryDuration
        fields = (
            "id",
            "name",
            "delivery_type",
            "days",
            "extra_charge",
            "is_active",
            "order",
        )
        read_only_fields = ("id",)

    def validate_extra_charge(self, value):
        if value < 0:
            raise serializers.ValidationError("extra_charge cannot be negative.")
        return value


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
    product_unit_name = serializers.SerializerMethodField()
    product_dosage = serializers.CharField(source="product.dosage", read_only=True)
    image_url = serializers.SerializerMethodField()
    current_price = serializers.DecimalField(source="product.price", max_digits=12, decimal_places=2, read_only=True)
    quantity_in_stock = serializers.IntegerField(source="product.quantity_in_stock", read_only=True)
    original_price_at_order = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, allow_null=True)

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
            "product_unit_name",
            "product_dosage",
            "dosage",
            "image_url",
            "quantity",
            "original_price_at_order",
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
            "product_unit_name",
            "product_dosage",
            "image_url",
            "current_price",
            "quantity_in_stock",
            "original_price_at_order",
        )

    def get_image_url(self, obj):
        return _product_image_url(obj.product, self.context.get("request"))

    def get_product_unit_name(self, obj):
        return obj.product.unit.name if obj.product and obj.product.unit else None


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
    subtotal_before_discount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2)
    base_delivery_fee = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    delivery_option_id = serializers.IntegerField(required=False, allow_null=True)
    delivery_option_name = serializers.CharField(required=False, allow_null=True)
    delivery_option_type = serializers.CharField(required=False, allow_null=True)
    delivery_option_charge = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
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

    def to_representation(self, instance):
        """
        Add per-item discounted pricing when a coupon is applied.
        This does not mutate DB; it only affects the response shape.
        """
        data = super().to_representation(instance)
        summary = data.get("summary") or {}
        discount_amount = Decimal(str(summary.get("discount_amount") or "0"))
        subtotal = Decimal(str(summary.get("subtotal") or "0"))
        subtotal_before = Decimal(str(summary.get("subtotal_before_discount") or "0"))
        items = data.get("items") or []
        if not items or subtotal <= 0:
            # still add line totals for consistency
            for it in items:
                qty = Decimal(str(it.get("quantity") or 0))
                unit = Decimal(str(it.get("price_at_order") or "0"))
                line_total = (unit * qty).quantize(Decimal("0.01"))
                it["line_total"] = line_total
                it["discount_amount"] = Decimal("0.00")
                it["line_total_after_discount"] = line_total
                it["unit_price_after_discount"] = unit.quantize(Decimal("0.01")) if qty else unit
            return data

        # If discount is already persisted (we have original subtotal > current subtotal),
        # compute per-item discount directly from stored prices (no allocation/double-apply).
        if subtotal_before > subtotal:
            for it in items:
                qty = Decimal(str(it.get("quantity") or 0))
                unit = Decimal(str(it.get("price_at_order") or "0"))
                orig_unit = Decimal(str(it.get("original_price_at_order") or it.get("price_at_order") or "0"))
                line_total_before = (orig_unit * qty).quantize(Decimal("0.01"))
                line_total_after = (unit * qty).quantize(Decimal("0.01"))
                d = max(Decimal("0.00"), (line_total_before - line_total_after).quantize(Decimal("0.01")))
                it["line_total"] = line_total_before
                it["discount_amount"] = d
                it["line_total_after_discount"] = line_total_after
                it["unit_price_after_discount"] = unit.quantize(Decimal("0.01")) if qty else unit
            data["items"] = items
            return data

        if discount_amount <= 0:
            for it in items:
                qty = Decimal(str(it.get("quantity") or 0))
                unit = Decimal(str(it.get("price_at_order") or "0"))
                line_total = (unit * qty).quantize(Decimal("0.01"))
                it["line_total"] = line_total
                it["discount_amount"] = Decimal("0.00")
                it["line_total_after_discount"] = line_total
                it["unit_price_after_discount"] = unit.quantize(Decimal("0.01")) if qty else unit
            return data

        # Allocate discount across items proportional to each line_total.
        line_totals = []
        for it in items:
            qty = Decimal(str(it.get("quantity") or 0))
            unit = Decimal(str(it.get("price_at_order") or "0"))
            line_total = (unit * qty).quantize(Decimal("0.01"))
            line_totals.append(line_total)

        allocated = []
        running = Decimal("0.00")
        for i, lt in enumerate(line_totals):
            if i == len(line_totals) - 1:
                d = (discount_amount - running).quantize(Decimal("0.01"))
            else:
                ratio = (lt / subtotal) if subtotal > 0 else Decimal("0")
                d = (discount_amount * ratio).quantize(Decimal("0.01"))
                running += d
            allocated.append(max(Decimal("0.00"), d))

        for it, lt, d in zip(items, line_totals, allocated):
            qty = Decimal(str(it.get("quantity") or 0))
            after = max(Decimal("0.00"), (lt - d).quantize(Decimal("0.01")))
            unit_after = (after / qty).quantize(Decimal("0.01")) if qty else Decimal("0.00")
            it["line_total"] = lt
            it["discount_amount"] = d
            it["line_total_after_discount"] = after
            it["unit_price_after_discount"] = unit_after

        data["items"] = items
        return data

    def get_summary(self, obj):
        from .services import get_cart_summary, validate_coupon, get_delivery_zone_for_district
        request = self.context.get("request")
        delivery_zone = None
        delivery_duration = None
        coupon = obj.coupon
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
            duration_id = request.query_params.get("delivery_duration_id") or request.data.get("delivery_duration_id")
            if duration_id:
                try:
                    delivery_duration = DeliveryDuration.objects.filter(
                        pk=duration_id,
                        is_active=True,
                    ).first()
                except Exception:
                    delivery_duration = None
            code = request.query_params.get("coupon_code") or request.data.get("coupon_code")
            if code:
                items = obj.items.select_related("product").all()
                subtotal = sum(((i.original_price_at_order or i.price_at_order) * i.quantity for i in items), Decimal("0"))
                try:
                    coupon, _ = validate_coupon(code, subtotal)
                except ValueError:
                    pass
        data = get_cart_summary(
            obj,
            delivery_zone=delivery_zone,
            coupon=coupon,
            delivery_duration=delivery_duration,
        )
        return data


class PlaceOrderFromCartSerializer(serializers.Serializer):
    shipping_address_id = serializers.IntegerField(required=True, help_text="UserAddress id for shipping")
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    delivery_duration_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Optional delivery option id (STANDARD/SAME_DAY/EXPRESS) managed by admin.",
    )
    payment_method = serializers.ChoiceField(
        choices=PaymentTransaction.Method.choices,
        required=False,
        default=PaymentTransaction.Method.COD,
        help_text="COD or online channel (BKASH/NAGAD/ROCKET/UPAY/CARD/ONLINE).",
    )


# ---- Coupon ----
class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = (
            "id",
            "code",
            "discount_type",
            "discount_value",
            "min_order_amount",
            "valid_from",
            "valid_until",
            "max_uses",
            "times_used",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "times_used", "created_at", "updated_at")


class CouponCreateUpdateSerializer(serializers.ModelSerializer):
    code = serializers.CharField(max_length=50)

    class Meta:
        model = Coupon
        fields = (
            "code",
            "discount_type",
            "discount_value",
            "min_order_amount",
            "valid_from",
            "valid_until",
            "max_uses",
            "is_active",
        )

    def validate_code(self, value):
        v = (value or "").strip().upper()
        if not v:
            raise serializers.ValidationError("Code is required.")
        return v

    def validate(self, attrs):
        dtype = attrs.get("discount_type") or getattr(self.instance, "discount_type", None)
        dval = attrs.get("discount_value") if "discount_value" in attrs else getattr(self.instance, "discount_value", None)
        if dtype == Coupon.DiscountType.PERCENT:
            if dval is None or dval <= 0 or dval > 100:
                raise serializers.ValidationError({"discount_value": "Percent discount must be between 0 and 100."})
        if dtype == Coupon.DiscountType.FIXED:
            if dval is None or dval <= 0:
                raise serializers.ValidationError({"discount_value": "Fixed discount must be greater than 0."})
        valid_from = attrs.get("valid_from") if "valid_from" in attrs else getattr(self.instance, "valid_from", None)
        valid_until = attrs.get("valid_until") if "valid_until" in attrs else getattr(self.instance, "valid_until", None)
        if valid_from and valid_until and valid_from > valid_until:
            raise serializers.ValidationError({"valid_until": "valid_until must be after valid_from."})
        return attrs


class CouponValidateRequestSerializer(serializers.Serializer):
    code = serializers.CharField()
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)


class CouponValidateResponseSerializer(serializers.Serializer):
    is_valid = serializers.BooleanField()
    code = serializers.CharField(allow_null=True, required=False)
    discount_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    discount_display = serializers.CharField(allow_null=True, required=False)
    message = serializers.CharField(allow_null=True, required=False)


# ---- Prescription ----
class PrescriptionItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = PrescriptionItem
        fields = ("id", "product", "product_name", "quantity_prescribed")


class PrescriptionImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PrescriptionImage
        fields = ("id", "image", "image_url", "order_display")

    def get_image_url(self, obj):
        if obj.image and self.context.get("request"):
            return self.context["request"].build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


class PrescriptionStatusHistorySerializer(serializers.ModelSerializer):
    """Status timeline entry; date/time in Bangladeshi time (Asia/Dhaka)."""
    created_at_bd = serializers.SerializerMethodField()
    date_bd = serializers.SerializerMethodField()
    time_bd = serializers.SerializerMethodField()

    class Meta:
        model = PrescriptionStatusHistory
        fields = ("id", "status", "created_at", "created_at_bd", "date_bd", "time_bd")

    def _bd_datetime(self, obj):
        dt = obj.created_at
        if timezone.is_naive(dt):
            dt = timezone.make_aware(dt)
        return dt.astimezone(BD_TZ)

    def get_created_at_bd(self, obj):
        return self._bd_datetime(obj).strftime("%Y-%m-%d %H:%M:%S %Z")

    def get_date_bd(self, obj):
        return self._bd_datetime(obj).strftime("%Y-%m-%d")

    def get_time_bd(self, obj):
        return self._bd_datetime(obj).strftime("%H:%M:%S")


class PrescriptionSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    items = PrescriptionItemSerializer(many=True, read_only=True)
    images = PrescriptionImageSerializer(many=True, read_only=True)
    status_history = PrescriptionStatusHistorySerializer(many=True, read_only=True)
    shipping_address_detail = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = (
            "id", "user", "user_email", "shipping_address", "shipping_address_detail",
            "save_prescription", "medicine_supply_duration", "custom_supply_days", "prescription_note", "additional_products_note",
            "image", "file", "images", "status", "issue_date",
            "patient_name_on_rx", "doctor_name", "doctor_reg_number", "has_signature",
            "verified_by", "verified_at", "notes", "items", "status_history",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "status", "verified_by", "verified_at", "created_at", "updated_at")

    def get_shipping_address_detail(self, obj):
        if not obj.shipping_address:
            return None
        addr = obj.shipping_address
        return {
            "id": addr.id,
            "full_name": addr.full_name,
            "email": getattr(addr, "email", "") or "",
            "phone": addr.phone,
            "gender": getattr(addr, "gender", None),
            "district": addr.district,
            "thana": getattr(addr, "thana", "") or "",
            "address": addr.address,
            "address_type": addr.address_type,
            "is_default": addr.is_default,
        }


class PrescriptionUploadSerializer(serializers.ModelSerializer):
    """Upload prescription order: multipart with images (or file), shipping_address, duration, note, save_prescription."""

    # For Swagger/docs: accept single or multiple files under the same key "images".
    # Implementation uses request.FILES.getlist("images") in the view.
    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        write_only=True,
        help_text="Upload one or more prescription images (multipart). Field name: images.",
    )

    shipping_address = serializers.PrimaryKeyRelatedField(
        queryset=UserAddress.objects.none(),
        required=False,
        allow_null=True,
        help_text="UserAddress id for shipping (from /api/auth/addresses/).",
    )

    class Meta:
        model = Prescription
        fields = (
            "images", "file", "issue_date", "patient_name_on_rx", "doctor_name", "doctor_reg_number",
            "save_prescription", "medicine_supply_duration", "custom_supply_days", "prescription_note", "additional_products_note",
            "shipping_address",
        )
        extra_kwargs = {"file": {"required": False}}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if "request" in self.context:
            self.fields["shipping_address"].queryset = UserAddress.objects.filter(
                user=self.context["request"].user
            )

    def validate(self, attrs):
        # Either file (legacy) or images via FILES in view - no need to require file here when images present
        if not attrs.get("file") and "request" in self.context:
            files = self.context["request"].FILES
            if not files.getlist("images") and not files.get("file"):
                raise serializers.ValidationError(
                    {"file": "Either upload a file or multiple images (field: images) is required."}
                )
        if attrs.get("medicine_supply_duration") == Prescription.MedicineSupplyDuration.CUSTOM:
            if not attrs.get("custom_supply_days"):
                raise serializers.ValidationError(
                    {"custom_supply_days": "Required when medicine_supply_duration is CUSTOM."}
                )
        return attrs

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
            # Confirm order: admin must add required products (items) when approving
            items = attrs.get("items") or []
            if not items or not any(
                entry.get("quantity_prescribed") and (entry.get("product") or entry.get("product_id"))
                for entry in items
            ):
                raise serializers.ValidationError(
                    {"items": "When approving, add at least one product with quantity_prescribed to confirm the order."}
                )
            # Validate stock for each product
            from .models import Product
            for entry in items:
                pid = entry.get("product") if isinstance(entry.get("product"), int) else entry.get("product_id")
                qty = entry.get("quantity_prescribed") or 0
                if pid and qty > 0:
                    try:
                        p = Product.objects.get(pk=pid)
                        if p.quantity_in_stock < qty:
                            raise serializers.ValidationError(
                                {"items": f"Insufficient stock for {p.name}. Available: {p.quantity_in_stock}."}
                            )
                    except Product.DoesNotExist:
                        raise serializers.ValidationError({"items": f"Product id {pid} not found."})
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


class UserNotificationSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True, allow_null=True)

    class Meta:
        model = UserNotification
        fields = (
            "id",
            "title",
            "message",
            "is_read",
            "read_at",
            "created_at",
            "created_by",
            "created_by_email",
        )
        read_only_fields = (
            "id",
            "is_read",
            "read_at",
            "created_at",
            "created_by",
            "created_by_email",
        )


class AdminBroadcastNotificationSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    message = serializers.CharField(max_length=2000)
    target_url = serializers.URLField(required=False, allow_blank=True)
    send_to_opted_in_only = serializers.BooleanField(
        required=False,
        default=False,
        help_text="When true, send only to users who enabled notification permission.",
    )
    audience_mode = serializers.ChoiceField(
        choices=NotificationCampaign.AudienceMode.choices,
        required=False,
        default=NotificationCampaign.AudienceMode.ALL_ACTIVE,
    )
    user_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=False,
        allow_empty=True,
    )
    role_filter = serializers.CharField(max_length=32, required=False, allow_blank=True)

    def validate(self, attrs):
        mode = attrs.get("audience_mode", NotificationCampaign.AudienceMode.ALL_ACTIVE)
        if len(attrs.get("user_ids") or []) > 5000:
            raise serializers.ValidationError({"user_ids": "Maximum 5000 user ids per request."})
        if mode == NotificationCampaign.AudienceMode.USER_IDS and not attrs.get("user_ids"):
            raise serializers.ValidationError({"user_ids": "user_ids is required when audience_mode is USER_IDS."})
        if mode == NotificationCampaign.AudienceMode.ROLE_BASED and not attrs.get("role_filter"):
            raise serializers.ValidationError({"role_filter": "role_filter is required when audience_mode is ROLE_BASED."})
        return attrs


class UserNotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotificationPreference
        fields = (
            "browser_permission",
            "is_enabled",
            "last_prompted_at",
            "user_agent",
            "platform",
            "updated_at",
        )
        read_only_fields = ("updated_at",)


class UserNotificationPreferenceUpdateSerializer(serializers.Serializer):
    browser_permission = serializers.ChoiceField(
        choices=UserNotificationPreference.BrowserPermission.choices,
        required=False,
    )
    is_enabled = serializers.BooleanField(required=False)
    platform = serializers.CharField(max_length=100, required=False, allow_blank=True)


class UserPushSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPushSubscription
        fields = (
            "id",
            "fcm_token",
            "is_active",
            "last_seen_at",
            "user_agent",
            "platform",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "last_seen_at", "user_agent", "created_at", "updated_at")


class UserPushSubscriptionUpsertSerializer(serializers.Serializer):
    fcm_token = serializers.CharField(max_length=255)
    platform = serializers.CharField(max_length=100, required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False, default=True)


class UserPushSubscriptionDeleteSerializer(serializers.Serializer):
    fcm_token = serializers.CharField(max_length=255)


class NotificationMarkedCountSerializer(serializers.Serializer):
    marked_count = serializers.IntegerField(min_value=0)


class NotificationRemovedCountSerializer(serializers.Serializer):
    removed_count = serializers.IntegerField(min_value=0)


class NotificationBroadcastResultSerializer(serializers.Serializer):
    detail = serializers.CharField()
    sent_count = serializers.IntegerField(min_value=0)
    title = serializers.CharField()
    send_to_opted_in_only = serializers.BooleanField()
    target_url = serializers.CharField(allow_blank=True)
    push_attempted = serializers.IntegerField(min_value=0)
    push_succeeded = serializers.IntegerField(min_value=0)
    push_failed = serializers.IntegerField(min_value=0)
    push_deactivated = serializers.IntegerField(min_value=0)
    push_async = serializers.BooleanField()
    campaign_id = serializers.IntegerField(min_value=1)


class NotificationHealthSerializer(serializers.Serializer):
    firebase_initialized = serializers.BooleanField()
    firebase_credential_source = serializers.CharField()
    firebase_init_error = serializers.CharField(allow_blank=True)
    celery_task_always_eager = serializers.BooleanField()
    redis_enabled = serializers.BooleanField()
    active_subscriptions = serializers.IntegerField(min_value=0)
    inactive_subscriptions = serializers.IntegerField(min_value=0)
    recently_deactivated_7d = serializers.IntegerField(min_value=0)


class NotificationDeliveryLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = NotificationDeliveryLog
        fields = (
            "id",
            "campaign",
            "user",
            "user_email",
            "status",
            "status_code",
            "permanent_failure",
            "reason",
            "provider_message_id",
            "created_at",
        )
        read_only_fields = fields


class NotificationCampaignSerializer(serializers.ModelSerializer):
    requested_by_email = serializers.EmailField(source="requested_by.email", read_only=True, allow_null=True)

    class Meta:
        model = NotificationCampaign
        fields = (
            "id",
            "title",
            "message",
            "target_url",
            "audience_mode",
            "role_filter",
            "source",
            "status",
            "dedupe_key",
            "metadata",
            "recipient_count",
            "push_attempted",
            "push_succeeded",
            "push_failed",
            "push_deactivated",
            "requested_by",
            "requested_by_email",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class NotificationCampaignCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    message = serializers.CharField(max_length=2000)
    target_url = serializers.URLField(required=False, allow_blank=True)
    send_to_opted_in_only = serializers.BooleanField(required=False, default=False)
    audience_mode = serializers.ChoiceField(
        choices=NotificationCampaign.AudienceMode.choices,
        default=NotificationCampaign.AudienceMode.ALL_ACTIVE,
    )
    user_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=False,
        allow_empty=True,
    )
    role_filter = serializers.CharField(max_length=32, required=False, allow_blank=True)
    dedupe_key = serializers.CharField(max_length=200, required=False, allow_blank=True)

    def validate(self, attrs):
        mode = attrs.get("audience_mode", NotificationCampaign.AudienceMode.ALL_ACTIVE)
        if len(attrs.get("user_ids") or []) > 5000:
            raise serializers.ValidationError({"user_ids": "Maximum 5000 user ids per request."})
        if mode == NotificationCampaign.AudienceMode.USER_IDS and not attrs.get("user_ids"):
            raise serializers.ValidationError({"user_ids": "user_ids is required when audience_mode is USER_IDS."})
        if mode == NotificationCampaign.AudienceMode.ROLE_BASED and not attrs.get("role_filter"):
            raise serializers.ValidationError({"role_filter": "role_filter is required when audience_mode is ROLE_BASED."})
        return attrs


class NotificationTestSendSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    message = serializers.CharField(max_length=2000)
    target_url = serializers.URLField(required=False, allow_blank=True)


# ---- Page (CMS) ----
class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ("id", "slug", "title", "content", "is_published", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


# ---- Blog ----
class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ("id", "name", "slug", "is_active", "order", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class BlogPostSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    article_image_url = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = (
            "id",
            "title",
            "slug",
            "category",
            "category_name",
            "category_slug",
            "short_description",
            "article_image",
            "article_image_url",
            "content",
            "is_published",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "category_name", "category_slug", "created_at", "updated_at")

    def get_article_image_url(self, obj):
        if obj.article_image and self.context.get("request"):
            return self.context["request"].build_absolute_uri(obj.article_image.url)
        return obj.article_image.url if obj.article_image else None


# ---- Settlements ----
class OrderSettlementSerializer(serializers.ModelSerializer):
    order_total = serializers.DecimalField(source="order.total", max_digits=12, decimal_places=2, read_only=True)
    order_status = serializers.CharField(source="order.status", read_only=True)
    order_created_at = serializers.DateTimeField(source="order.created_at", read_only=True)

    class Meta:
        model = OrderSettlement
        fields = (
            "id",
            "order",
            "order_total",
            "order_status",
            "order_created_at",
            "payment_method",
            "payment_status",
            "commission_rate",
            "commission_amount",
            "gross_amount",
            "net_payable",
            "status",
            "cash_collected_amount",
            "cash_deposit_reference",
            "cash_deposited_at",
            "payout_reference",
            "settled_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "commission_amount", "gross_amount", "net_payable", "created_at", "updated_at")


class SettlementCashDepositSerializer(serializers.Serializer):
    cash_collected_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    cash_deposit_reference = serializers.CharField(max_length=255, required=False, allow_blank=True)


class SettlementPayoutSerializer(serializers.Serializer):
    payout_reference = serializers.CharField(max_length=255, required=False, allow_blank=True)


class B2BCustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = B2BCustomerProfile
        fields = ("id", "user", "company_name", "commission_rate", "is_active", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class B2BCommissionEntrySerializer(serializers.ModelSerializer):
    order_total = serializers.DecimalField(source="order.total", max_digits=12, decimal_places=2, read_only=True)
    order_status = serializers.CharField(source="order.status", read_only=True)

    class Meta:
        model = B2BCommissionEntry
        fields = (
            "id",
            "customer",
            "order",
            "order_total",
            "order_status",
            "commission_rate",
            "commission_amount",
            "status",
            "note",
            "settled_at",
            "created_at",
        )
        read_only_fields = ("id", "commission_amount", "created_at")
