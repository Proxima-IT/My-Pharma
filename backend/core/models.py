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
    image = models.ImageField(upload_to="products/%Y/%m/", blank=True, null=True)
    quantity_in_stock = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)
    is_active = models.BooleanField(default=True)
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

    class Meta:
        db_table = "core_order_item"
        unique_together = [["order", "product"]]

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


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
