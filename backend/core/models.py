"""
Core models: Category, Product (with inventory), Order, OrderItem, Prescription, Consultation, Page (CMS).
Aligned with RBAC: Products/Inventory/Orders/Prescriptions (Pharmacy Admin), Consultations (Doctor), CMS (Super/Pharmacy).
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
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
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
    Prescription flow: UPLOADED -> PENDING (in queue) -> APPROVED or REJECTED.
    APPROVED -> USED when linked to an order.
    """
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"       # In review queue (uploaded)
        APPROVED = "APPROVED", "Approved"    # Valid Rx, can be linked to order
        REJECTED = "REJECTED", "Rejected"    # Invalid/Expired
        USED = "USED", "Used"                # Linked to order

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="prescriptions",
        db_index=True,
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
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "core_prescription"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status"]), models.Index(fields=["user", "status"])]

    def __str__(self):
        return f"Prescription #{self.id} ({self.user_id})"


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
