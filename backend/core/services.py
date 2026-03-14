"""
Cart, checkout, delivery, and payment helpers.
Aligned with Cart & Checkout, Order Workflow, Payment Logic docs.
"""
from decimal import Decimal

from django.utils import timezone
from datetime import timedelta

from .constants import (
    MIN_ORDER_BDT,
    FREE_DELIVERY_ABOVE_BDT,
    DELIVERY_FEES,
    DELIVERY_ZONE_CITY,
    DELIVERY_ZONE_SUBURBS,
    DELIVERY_ZONE_OTHER,
    DEFAULT_DELIVERY_FEE_BDT,
    DELIVERY_ZONE_CITY_DISTRICTS,
    DELIVERY_ZONE_SUBURBS_DISTRICTS,
    PRICE_LOCK_HOURS,
    PAYMENT_FEE_RATES,
    PAYMENT_METHOD_COD,
)
from .models import Order, Cart, CartItem, Coupon, Product, ProductReview


def get_delivery_fee(subtotal: Decimal, delivery_zone: str = None) -> Decimal:
    """
    Base fee BDT 50 city, BDT 100 suburbs, BDT 150+ other.
    Delivery fee waived for orders above BDT 500. If delivery_zone is None, returns DEFAULT_DELIVERY_FEE_BDT.
    """
    if subtotal >= FREE_DELIVERY_ABOVE_BDT:
        return Decimal("0")
    if not delivery_zone:
        return DEFAULT_DELIVERY_FEE_BDT
    return DELIVERY_FEES.get(delivery_zone, DELIVERY_FEES[DELIVERY_ZONE_OTHER])


def get_delivery_zone_for_district(district: str) -> str:
    """Map Bangladesh district to delivery zone (CITY, SUBURBS, OTHER)."""
    if not district:
        return DELIVERY_ZONE_OTHER
    d = (district or "").strip()
    if d in DELIVERY_ZONE_CITY_DISTRICTS:
        return DELIVERY_ZONE_CITY
    if d in DELIVERY_ZONE_SUBURBS_DISTRICTS:
        return DELIVERY_ZONE_SUBURBS
    return DELIVERY_ZONE_OTHER


def get_price_locked_until():
    """Price locked for 24 hours at add-to-cart."""
    return timezone.now() + timedelta(hours=PRICE_LOCK_HOURS)


def get_payment_fee(amount: Decimal, payment_method: str) -> Decimal:
    """COD: 0; bKash/Nagad: 1.5%."""
    rate = PAYMENT_FEE_RATES.get(payment_method, Decimal("0"))
    return (amount * rate).quantize(Decimal("0.01"))


def validate_min_order(subtotal: Decimal) -> bool:
    """Minimum order value BDT 100."""
    return subtotal >= MIN_ORDER_BDT


def can_cancel_order(order: Order) -> bool:
    """Cancel allowed before SHIPPED status."""
    return order.status in (Order.Status.PENDING, Order.Status.CONFIRMED, Order.Status.PROCESSING)


def get_or_create_cart(user):
    """Get or create cart for user."""
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


def validate_coupon(code: str, subtotal: Decimal):
    """
    Validate coupon and return (coupon, discount_amount). discount_amount is BDT to subtract.
    Raises ValueError if invalid. Returns (None, 0) for empty code.
    """
    if not (code or "").strip():
        return None, Decimal("0")
    c = Coupon.objects.filter(code=code.strip().upper(), is_active=True).first()
    if not c:
        raise ValueError("Invalid or inactive coupon.")
    now = timezone.now()
    if c.valid_from and now < c.valid_from:
        raise ValueError("Coupon not yet valid.")
    if c.valid_until and now > c.valid_until:
        raise ValueError("Coupon has expired.")
    if c.max_uses is not None and c.times_used >= c.max_uses:
        raise ValueError("Coupon usage limit reached.")
    if c.min_order_amount is not None and subtotal < c.min_order_amount:
        raise ValueError("Minimum order amount not met.")
    if c.discount_type == Coupon.DiscountType.PERCENT:
        discount = (subtotal * c.discount_value / Decimal("100")).quantize(Decimal("0.01"))
    else:
        discount = min(c.discount_value, subtotal)
    return c, discount


def get_cart_summary(cart, delivery_zone: str = None, coupon=None):
    """
    Return dict: subtotal, delivery_fee, discount_amount, total_payable, discount_display, coupon_code.
    """
    items = cart.items.select_related("product").all()
    subtotal = sum((item.price_at_order * item.quantity for item in items), Decimal("0"))
    delivery_fee = get_delivery_fee(subtotal, delivery_zone)
    before_discount = subtotal + delivery_fee
    discount_amount = Decimal("0")
    discount_display = None
    coupon_code = None
    if coupon:
        if isinstance(coupon, Coupon):
            if coupon.discount_type == Coupon.DiscountType.PERCENT:
                discount_amount = (before_discount * coupon.discount_value / Decimal("100")).quantize(Decimal("0.01"))
                discount_display = f"-{coupon.discount_value}%"
            else:
                discount_amount = min(coupon.discount_value, before_discount)
                discount_display = f"-৳{coupon.discount_value}"
            coupon_code = coupon.code
        else:
            coupon_code = str(coupon)
    total_payable = max(Decimal("0"), before_discount - discount_amount)
    return {
        "subtotal": subtotal,
        "delivery_fee": delivery_fee,
        "discount_amount": discount_amount,
        "total_payable": total_payable,
        "discount_display": discount_display,
        "coupon_code": coupon_code,
    }


def update_product_review_aggregates(product):
    """Recompute Product.rating_avg and Product.review_count from ProductReview for the given product."""
    from django.db.models import Avg, Count
    agg = ProductReview.objects.filter(product=product).aggregate(
        avg_rating=Avg("rating"),
        count=Count("id"),
    )
    product.rating_avg = Decimal(str(round(agg["avg_rating"] or 0, 2)))
    product.review_count = agg["count"] or 0
    product.save(update_fields=["rating_avg", "review_count"])
