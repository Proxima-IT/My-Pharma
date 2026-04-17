"""
Core models: Category, Product (with inventory), Order, OrderItem, Prescription,
Consultation, Notifications, Blog, Page (CMS).
Aligned with RBAC: Products/Inventory/Orders/Prescriptions (Pharmacy Admin),
Consultations (Doctor), CMS/Notifications (Super/Pharmacy).
"""
from django.conf import settings
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    """Hierarchical: parent=None is root (e.g. PRODUCT CATALOG); children = MEDICINES, SUPPLEMENTS, DEVICES."""
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
        db_index=True,
    )
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    image = models.ImageField(upload_to="categories/%Y/%m/", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    show_in_sidebar = models.BooleanField(
        default=False,
        db_index=True,
        help_text="When true, this category is shown in the public sidebar menu.",
    )
    sidebar_order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Sidebar display order; lower values appear first.",
    )
    is_featured_home = models.BooleanField(
        default=False,
        db_index=True,
        help_text="When true, this category is shown in home featured categories.",
    )
    featured_order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Home featured display order; lower values appear first.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_category"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class SidebarCategory(models.Model):
    """Left sidebar category row: icon/image + title (e.g. All Product, Medicine, Healthcare)."""
    image = models.ImageField(upload_to="sidebar/%Y/%m/", blank=True, null=True)
    title = models.CharField(max_length=100)

    class Meta:
        db_table = "core_sidebar_category"
        verbose_name_plural = "Sidebar categories"
        ordering = ["id"]

    def __str__(self):
        return self.title


class Ad(models.Model):
    """Promotional ad/banner: image + destination link. Optional order and is_active for display control."""
    image = models.ImageField(upload_to="ads/%Y/%m/")
    link = models.URLField(max_length=500, blank=True, help_text="Destination URL when ad is clicked.")
    order = models.PositiveSmallIntegerField(default=0, help_text="Display order; lower first.")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_ad"
        verbose_name_plural = "Ads"
        ordering = ["order", "id"]

    def __str__(self):
        return self.link or f"Ad #{self.id}"


class Combo(models.Model):
    """Combo package card (e.g. Health Combo, Baby Care Combo) with image, link, and fixed price."""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="combos/%Y/%m/", blank=True, null=True)
    link = models.URLField(
        max_length=500,
        blank=True,
        help_text="Destination URL when combo card is clicked (e.g. product list or CMS page).",
    )
    price = models.DecimalField(max_digits=12, decimal_places=2)
    original_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Optional struck-through price for showing discount on combo.",
    )
    bg_color = models.CharField(
        max_length=32,
        blank=True,
        help_text="Optional background color for combo card (e.g. hex code or Tailwind class).",
    )
    order = models.PositiveSmallIntegerField(default=0, help_text="Display order; lower first.")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_combo"
        verbose_name_plural = "Combos"
        ordering = ["order", "id"]

    def __str__(self):
        return self.title


class AppLogo(models.Model):
    """App logo assets (e.g. primary header logo, footer logo) keyed by slug."""
    slug = models.SlugField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text="Identifier for where the logo is used (e.g. 'header', 'footer').",
    )
    image = models.ImageField(upload_to="logos/%Y/%m/")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_app_logo"
        verbose_name_plural = "App logos"
        ordering = ["slug"]

    def __str__(self):
        return self.slug


class Brand(models.Model):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_brand"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Ingredient(models.Model):
    """Generic/active ingredient; products with same ingredient_id are branded equivalents."""
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_ingredient"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="products")
    brand = models.ForeignKey(
        "Brand",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
        db_index=True,
    )
    ingredient = models.ForeignKey(
        "Ingredient",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
        db_index=True,
    )
    requires_prescription = models.BooleanField(default=False, db_index=True)
    is_generic = models.BooleanField(
        default=False,
        db_index=True,
        help_text="True for generic/unbranded equivalents; used to suggest lower-cost alternatives for the same active ingredient.",
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, db_index=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    original_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="MRP / list price for showing crossed-out price and discount percentage.",
    )
    image = models.ImageField(upload_to="products/%Y/%m/", blank=True, null=True)
    quantity_in_stock = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)
    is_active = models.BooleanField(default=True)
    # Medicine-specific: packaging and dosage
    unit_label = models.CharField(
        max_length=120,
        blank=True,
        help_text="e.g. '10 Tablets (1 Strip)', '20 Tablets (2 Strip)'.",
    )
    dosage = models.CharField(
        max_length=50,
        blank=True,
        help_text="Strength e.g. '50mg', '500mg', '5ml' for display and dosage selection.",
    )
    # Social proof
    rating_avg = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        help_text="Average rating 0–5 for display (e.g. 5.0).",
    )
    review_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of reviews (e.g. for '1.2k+ Reviews').",
    )
    # Structured content for details page
    key_benefits = models.JSONField(
        default=list,
        blank=True,
        help_text="List of benefit strings for Description tab bullet points.",
    )
    specifications = models.JSONField(
        default=dict,
        blank=True,
        help_text="Key-value pairs for Specification tab (e.g. {'Dosage Form': 'Oral Tablet'}).",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
       
    class Meta:
        db_table = "core_product"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["price"]),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def is_low_stock(self):
        return self.quantity_in_stock <= self.low_stock_threshold

    @property
    def discount_percentage(self):
        """Percentage off when original_price > price; None if no discount."""
        if self.original_price and self.original_price > 0 and self.price < self.original_price:
            from decimal import Decimal
            return int((Decimal("1") - self.price / self.original_price) * 100)
        return None


class ProductImage(models.Model):
    """Multiple images per product (gallery). Product.image remains the primary/feature image."""
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
        db_index=True,
    )
    image = models.ImageField(upload_to="products/%Y/%m/")
    order = models.PositiveSmallIntegerField(default=0, help_text="Display order; lower first.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "core_product_image"
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.product.name} – image #{self.order}"


class ProductDosage(models.Model):
    """Multiple dosage options per product (e.g. 50mg, 500mg). Product.dosage remains primary/default."""
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="dosage_options",
        db_index=True,
    )
    dosage_label = models.CharField(
        max_length=50,
        help_text="Strength e.g. '50mg', '500mg', '5ml'.",
    )
    order = models.PositiveSmallIntegerField(default=0, help_text="Display order; lower first.")

    class Meta:
        db_table = "core_product_dosage"
        ordering = ["order", "id"]
        unique_together = [["product", "dosage_label"]]
        verbose_name_plural = "Product dosages"

    def __str__(self):
        return f"{self.product.name} – {self.dosage_label}"


class DeliveryDuration(models.Model):
    """Delivery duration options (e.g. 2–3 days, 1 week). Admin CRUD; order can reference one."""
    class DeliveryType(models.TextChoices):
        STANDARD = "STANDARD", "Standard Delivery"
        SAME_DAY = "SAME_DAY", "Same Day Delivery"
        EXPRESS = "EXPRESS", "Express Delivery"

    name = models.CharField(max_length=100, help_text="e.g. Standard 3–5 days")
    delivery_type = models.CharField(
        max_length=20,
        choices=DeliveryType.choices,
        default=DeliveryType.STANDARD,
        db_index=True,
    )
    days = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Optional number of days for display.",
    )
    extra_charge = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Additional charge (BDT) over the base delivery fee for this option.",
    )
    is_active = models.BooleanField(default=True, db_index=True)
    order = models.PositiveSmallIntegerField(default=0, help_text="Display order; lower first.")

    class Meta:
        db_table = "core_delivery_duration"
        ordering = ["order", "id"]

    def __str__(self):
        return self.name


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        PROCESSING = "PROCESSING", "Processing"
        SHIPPED = "SHIPPED", "Shipped"
        DELIVERED = "DELIVERED", "Delivered"
        CANCELLED = "CANCELLED", "Cancelled"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
        db_index=True,
    )
    prescription = models.ForeignKey(
        "Prescription",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
        db_index=True,
        help_text="Linked prescription when order contains prescription-only medicines.",
    )
    duration = models.ForeignKey(
        "DeliveryDuration",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
        db_index=True,
        help_text="Expected delivery duration (admin can set).",
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    # Pricing breakdown (so admin/user can see discounts and delivery)
    subtotal_before_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    coupon = models.ForeignKey(
        "Coupon",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
        db_index=True,
    )
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Total payable (after discount + delivery fee).")
    shipping_address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    message = models.TextField(blank=True, help_text="Customer message with the order.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_order"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "status"])]

    def __str__(self):
        return f"Order #{self.id} ({self.user_id})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="order_items")
    quantity = models.PositiveIntegerField()
    price_at_order = models.DecimalField(max_digits=12, decimal_places=2)
    dosage = models.CharField(
        max_length=50,
        blank=True,
        help_text="Selected dosage for this line (e.g. 50mg, 500mg).",
    )

    class Meta:
        db_table = "core_order_item"
        unique_together = [["order", "product"]]

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


class OrderImage(models.Model):
    """Multiple images uploaded by the customer when placing an order."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="images", db_index=True)
    image = models.ImageField(upload_to="orders/%Y/%m/")
    order_display = models.PositiveSmallIntegerField(default=0, help_text="Display order; lower first.")

    class Meta:
        db_table = "core_order_image"
        ordering = ["order_display", "id"]

    def __str__(self):
        return f"Order #{self.order_id} – image #{self.order_display}"


class OrderStatusHistory(models.Model):
    """Timeline of order status changes; timestamps in Bangladeshi time (Asia/Dhaka) for display."""
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="status_history",
        db_index=True,
    )
    status = models.CharField(max_length=20, choices=Order.Status.choices, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "core_order_status_history"
        ordering = ["created_at"]
        verbose_name_plural = "Order status history"

    def __str__(self):
        return f"Order #{self.order_id} – {self.status} at {self.created_at}"


# ------------------------------------------------------------------------------
# Payment settlements (commission + payout) + B2B commissions
# ------------------------------------------------------------------------------


class OrderSettlement(models.Model):
    """
    Payment settlement record for an order.

    Flow (aligned with Payment Settlements screenshot):
    - Payment confirmation: ONLINE => PAID, COD => PENDING_CASH
    - Delivery complete => compute net payable (gross - commission)
    - COD cash handling => rider deposits cash (mark CASH_DEPOSITED)
    - Payout to pharmacy => mark SETTLED (optionally record payout ref)
    - Refunds/cancellations can mark REFUNDED/CANCELLED
    """

    class PaymentMethod(models.TextChoices):
        COD = "COD", "Cash on Delivery"
        ONLINE = "ONLINE", "Online"

    class PaymentStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PAID = "PAID", "Paid"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending Settlement"
        CASH_DEPOSITED = "CASH_DEPOSITED", "Cash Deposited"
        SETTLED = "SETTLED", "Settled"
        REFUNDED = "REFUNDED", "Refunded"
        CANCELLED = "CANCELLED", "Cancelled"

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="settlement", db_index=True)
    payment_method = models.CharField(max_length=10, choices=PaymentMethod.choices, default=PaymentMethod.COD, db_index=True)
    payment_status = models.CharField(max_length=10, choices=PaymentStatus.choices, default=PaymentStatus.PENDING, db_index=True)

    # Commission settings (platform commission deducted from gross).
    commission_rate = models.DecimalField(max_digits=6, decimal_places=4, default=0, help_text="Commission rate as fraction (e.g. 0.0500 = 5%).")
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    gross_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Order total amount used for settlement.")
    net_payable = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="gross_amount - commission_amount")

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)

    # COD cash handling
    cash_collected_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cash_deposit_reference = models.CharField(max_length=255, blank=True)
    cash_deposited_at = models.DateTimeField(null=True, blank=True)

    # Pharmacy payout
    payout_reference = models.CharField(max_length=255, blank=True)
    settled_at = models.DateTimeField(null=True, blank=True)

    # Audit
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_settlements",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_settlements",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_order_settlement"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["payment_method", "payment_status"]),
        ]

    def __str__(self):
        return f"Settlement for Order #{self.order_id} ({self.status})"


class PaymentTransaction(models.Model):
    """Tracks SSLCommerz transaction lifecycle for an order."""

    class Method(models.TextChoices):
        COD = "COD", "Cash on Delivery"
        BKASH = "BKASH", "bKash"
        NAGAD = "NAGAD", "Nagad"
        ROCKET = "ROCKET", "Rocket"
        UPAY = "UPAY", "Upay"
        CARD = "CARD", "Card"
        ONLINE = "ONLINE", "Online"

    class Status(models.TextChoices):
        INITIATED = "INITIATED", "Initiated"
        PENDING = "PENDING", "Pending"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"
        CANCELLED = "CANCELLED", "Cancelled"
        IPN_VERIFIED = "IPN_VERIFIED", "IPN Verified"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payment_transactions",
        null=True,
        blank=True,
        db_index=True,
    )
    order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        related_name="payment_transactions",
        null=True,
        blank=True,
        db_index=True,
    )
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.COD, db_index=True)
    provider = models.CharField(max_length=30, default="SSLCOMMERZ")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default="BDT")

    tran_id = models.CharField(max_length=64, unique=True, db_index=True)
    val_id = models.CharField(max_length=128, blank=True, db_index=True)
    session_key = models.CharField(max_length=128, blank=True, db_index=True)
    gateway_url = models.URLField(max_length=500, blank=True)
    bank_tran_id = models.CharField(max_length=128, blank=True, db_index=True)
    card_type = models.CharField(max_length=120, blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.INITIATED, db_index=True)
    shipping_address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    subtotal_before_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    coupon_id_ref = models.PositiveIntegerField(null=True, blank=True)
    delivery_duration_id_ref = models.PositiveIntegerField(null=True, blank=True)
    cart_snapshot = models.JSONField(default=list, blank=True)
    request_payload = models.JSONField(default=dict, blank=True)
    gateway_response = models.JSONField(default=dict, blank=True)
    verified_response = models.JSONField(default=dict, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_payment_transaction"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["order", "status"]),
            models.Index(fields=["method", "status"]),
        ]

    def __str__(self):
        return f"Payment {self.tran_id} ({self.status})"


class B2BCustomerProfile(models.Model):
    """Marks a user as a B2B customer with a commission rate for bulk orders."""

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="b2b_profile", db_index=True)
    company_name = models.CharField(max_length=255, blank=True)
    commission_rate = models.DecimalField(
        max_digits=6,
        decimal_places=4,
        default=0,
        help_text="Commission rate as fraction (e.g. 0.0200 = 2%).",
    )
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_b2b_customer_profile"
        ordering = ["-created_at"]

    def __str__(self):
        return self.company_name or f"B2B #{self.user_id}"


class B2BCommissionEntry(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SETTLED = "SETTLED", "Settled"

    customer = models.ForeignKey(B2BCustomerProfile, on_delete=models.CASCADE, related_name="commissions", db_index=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="b2b_commissions", db_index=True)
    commission_rate = models.DecimalField(max_digits=6, decimal_places=4, default=0)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING, db_index=True)
    note = models.CharField(max_length=255, blank=True)
    settled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "core_b2b_commission_entry"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["customer", "status", "created_at"]),
            models.Index(fields=["order"]),
        ]
        constraints = [
            models.UniqueConstraint(fields=["customer", "order"], name="unique_b2b_commission_per_order"),
        ]

    def __str__(self):
        return f"B2B commission #{self.id} ({self.status})"


class ProductReview(models.Model):
    """User review and rating for a product. One review per user per product; user must have purchased the product."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="product_reviews",
        db_index=True,
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews",
        db_index=True,
    )
    rating = models.PositiveSmallIntegerField(
        help_text="Rating 1–5.",
    )
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_product_review"
        ordering = ["-created_at"]
        unique_together = [["user", "product"]]
        verbose_name_plural = "Product reviews"
        indexes = [models.Index(fields=["product"])]

    def __str__(self):
        return f"{self.user_id} – {self.product.name} ({self.rating})"


class ProductReviewImage(models.Model):
    """Image attached to a product review."""
    review = models.ForeignKey(
        ProductReview,
        on_delete=models.CASCADE,
        related_name="images",
        db_index=True,
    )
    image = models.ImageField(upload_to="reviews/%Y/%m/")
    order = models.PositiveSmallIntegerField(default=0, help_text="Display order; lower first.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "core_product_review_image"
        ordering = ["order", "id"]

    def __str__(self):
        return f"Review #{self.review_id} – image #{self.order}"


class Cart(models.Model):
    """One cart per user; holds items until checkout."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
        db_index=True,
    )
    coupon = models.ForeignKey(
        "Coupon",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="carts",
        db_index=True,
        help_text="Applied coupon for this cart (optional).",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_cart"
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Cart ({self.user_id})"


class CartItem(models.Model):
    """Cart line: product + quantity; price_at_order locks price at add-to-cart."""
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
        db_index=True,
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="cart_items",
        db_index=True,
    )
    quantity = models.PositiveIntegerField(default=1)
    original_price_at_order = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Locked unit price at add-to-cart before any coupon discount is applied.",
    )
    price_at_order = models.DecimalField(max_digits=12, decimal_places=2)
    dosage = models.CharField(
        max_length=50,
        blank=True,
        help_text="Selected dosage for this line (e.g. 50mg, 500mg).",
    )

    class Meta:
        db_table = "core_cart_item"
        unique_together = [["cart", "product"]]
        ordering = ["id"]

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


class Coupon(models.Model):
    """Discount coupon: code, type (percent/fixed), value, optional min order and validity."""
    class DiscountType(models.TextChoices):
        PERCENT = "PERCENT", "Percent"
        FIXED = "FIXED", "Fixed amount"

    code = models.CharField(max_length=50, unique=True, db_index=True)
    discount_type = models.CharField(max_length=10, choices=DiscountType.choices)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    max_uses = models.PositiveIntegerField(null=True, blank=True, help_text="Null = unlimited")
    times_used = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_coupon"
        ordering = ["-created_at"]

    def __str__(self):
        return self.code


class Prescription(models.Model):
    """
    Prescription ordering flow: user uploads images, selects address, duration, note.
    Status: PENDING -> APPROVED/REJECTED (admin verify); APPROVED -> USED when linked to order.
    """
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"       # In review queue (uploaded)
        APPROVED = "APPROVED", "Approved"    # Valid Rx, can be linked to order
        REJECTED = "REJECTED", "Rejected"    # Invalid/Expired
        USED = "USED", "Used"                # Linked to order

    class MedicineSupplyDuration(models.TextChoices):
        SEVEN_DAYS = "7_DAYS", "7 Days"
        FIFTEEN_DAYS = "15_DAYS", "15 Days"
        ONE_MONTH = "1_MONTH", "1 Month"
        TWO_MONTHS = "2_MONTHS", "2 Months"
        CUSTOM = "CUSTOM", "Custom"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="prescriptions",
        db_index=True,
    )
    # Shipping: user selects from saved addresses (UserAddress)
    shipping_address = models.ForeignKey(
        "authentication.UserAddress",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="prescription_orders",
        db_index=True,
        help_text="Selected shipping address for this prescription order.",
    )
    save_prescription = models.BooleanField(
        default=False,
        help_text="Save prescription for future reference/reorder.",
    )
    medicine_supply_duration = models.CharField(
        max_length=20,
        choices=MedicineSupplyDuration.choices,
        blank=True,
        db_index=True,
        help_text="7 Days, 15 Days, 1 Month, 2 Months, or Custom.",
    )
    custom_supply_days = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="When medicine_supply_duration is CUSTOM, number of days.",
    )
    prescription_note = models.TextField(
        blank=True,
        help_text="User note for the uploading prescription.",
    )
    additional_products_note = models.TextField(
        blank=True,
        help_text="Optional note about additional products the user wants with this prescription.",
    )
    image = models.ImageField(upload_to="prescriptions/%Y/%m/", blank=True, null=True)  # legacy
    file = models.FileField(upload_to="prescriptions/%Y/%m/", blank=True, null=True)  # JPG/PNG/PDF, max 10MB
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    issue_date = models.DateField(null=True, blank=True, help_text="Prescription issue date; must not be older than 6 months.")
    patient_name_on_rx = models.CharField(max_length=200, blank=True, help_text="Patient name as on prescription; must match account holder.")
    doctor_name = models.CharField(max_length=200, blank=True)
    doctor_reg_number = models.CharField(max_length=100, blank=True)
    has_signature = models.BooleanField(default=False, help_text="Doctor signature present (set at verification).")
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_prescriptions",
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, help_text="Internal admin notes.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_prescription"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status"]), models.Index(fields=["user", "status"])]

    def __str__(self):
        return f"Prescription #{self.id} ({self.user_id})"


class PrescriptionImage(models.Model):
    """Multiple prescription images per order (upload prescription flow)."""
    prescription = models.ForeignKey(
        Prescription,
        on_delete=models.CASCADE,
        related_name="images",
        db_index=True,
    )
    image = models.ImageField(upload_to="prescriptions/%Y/%m/")
    order_display = models.PositiveSmallIntegerField(default=0, help_text="Display order; lower first.")

    class Meta:
        db_table = "core_prescription_image"
        ordering = ["order_display", "id"]

    def __str__(self):
        return f"Prescription #{self.prescription_id} – image #{self.order_display}"


class PrescriptionStatusHistory(models.Model):
    """Timeline of prescription status changes; timestamps in Bangladeshi time (Asia/Dhaka) for display."""
    prescription = models.ForeignKey(
        Prescription,
        on_delete=models.CASCADE,
        related_name="status_history",
        db_index=True,
    )
    status = models.CharField(max_length=20, choices=Prescription.Status.choices, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "core_prescription_status_history"
        ordering = ["created_at"]
        verbose_name_plural = "Prescription status history"

    def __str__(self):
        return f"Prescription #{self.prescription_id} – {self.status} at {self.created_at}"


class PrescriptionItem(models.Model):
    """Medicines listed on prescription (set at approval); used to validate order quantity."""
    prescription = models.ForeignKey(
        Prescription,
        on_delete=models.CASCADE,
        related_name="items",
        db_index=True,
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="prescription_items",
    )
    quantity_prescribed = models.PositiveIntegerField()

    class Meta:
        db_table = "core_prescription_item"
        unique_together = [["prescription", "product"]]
        ordering = ["product_id"]

    def __str__(self):
        return f"Rx #{self.prescription_id} – {self.product.name} x {self.quantity_prescribed}"


class Consultation(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        CLOSED = "CLOSED", "Closed"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="consultations",
        db_index=True,
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="doctor_consultations",
    )
    subject = models.CharField(max_length=200)
    message = models.TextField()
    response = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_consultation"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "status"]), models.Index(fields=["doctor", "status"])]

    def __str__(self):
        return f"Consultation #{self.id} - {self.subject}"


class UserNotification(models.Model):
    """Per-user notification row; admins can broadcast to all non-guest users."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
        db_index=True,
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_notifications",
        help_text="Admin user who sent this notification.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "core_user_notification"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_read"]),
            models.Index(fields=["user", "created_at"]),
        ]

    def __str__(self):
        return f"Notification #{self.id} -> user {self.user_id}"


class UserNotificationPreference(models.Model):
    """Per-user browser notification permission and opt-in state."""

    class BrowserPermission(models.TextChoices):
        DEFAULT = "default", "Default"
        GRANTED = "granted", "Granted"
        DENIED = "denied", "Denied"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notification_preference",
        db_index=True,
    )
    browser_permission = models.CharField(
        max_length=20,
        choices=BrowserPermission.choices,
        default=BrowserPermission.DEFAULT,
        db_index=True,
    )
    is_enabled = models.BooleanField(
        default=False,
        db_index=True,
        help_text="True when user granted permission and wants push/browser notifications.",
    )
    last_prompted_at = models.DateTimeField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    platform = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_user_notification_preference"
        ordering = ["-updated_at"]

    def __str__(self):
        return f"NotificationPreference(user={self.user_id}, enabled={self.is_enabled}, permission={self.browser_permission})"


class UserPushSubscription(models.Model):
    """Stores Firebase Cloud Messaging (FCM) token per user/device."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="push_subscriptions",
        db_index=True,
    )
    fcm_token = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True, db_index=True)
    last_seen_at = models.DateTimeField(auto_now=True)
    user_agent = models.CharField(max_length=500, blank=True)
    platform = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_user_push_subscription"
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["user", "is_active"]),
            models.Index(fields=["user", "updated_at"]),
        ]

    def __str__(self):
        return f"PushSubscription(user={self.user_id}, active={self.is_active})"


class BlogCategory(models.Model):
    """Blog taxonomy (separate from product Category)."""

    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveSmallIntegerField(default=0, help_text="Display order; lower first.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_blog_category"
        verbose_name_plural = "Blog categories"
        ordering = ["order", "name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class BlogPost(models.Model):
    """Blog article: title, category, rich text body. Admins publish via API or Django admin."""

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    category = models.ForeignKey(
        BlogCategory,
        on_delete=models.PROTECT,
        related_name="posts",
        db_index=True,
    )
    short_description = models.TextField(
        blank=True,
        help_text="Short summary for listing cards and SEO.",
    )
    article_image = models.ImageField(
        upload_to="blog/%Y/%m/",
        blank=True,
        null=True,
        help_text="Hero image for the article.",
    )
    content = models.TextField(help_text="Article body (plain text or HTML).")
    is_published = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "core_blog_post"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["category", "created_at"])]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) or "post"
            slug = base
            n = 1
            while BlogPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{n}"
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)


class Page(models.Model):
    """CMS page. SUPER_ADMIN: full CRUD. PHARMACY_ADMIN: limited (e.g. edit certain slugs)."""
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
        
    class Meta:
        db_table = "core_page"
        ordering = ["slug"]

    def __str__(self):
        return self.title
