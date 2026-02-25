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
    DEFAULT_DELIVERY_FEE_BDT,
    DELIVERY_FEES,
    DELIVERY_ZONE_CITY,
    DELIVERY_ZONE_SUBURBS,
    DELIVERY_ZONE_OTHER,
    PRICE_LOCK_HOURS,
    PAYMENT_FEE_RATES,
    PAYMENT_METHOD_COD,
)
from .models import Order, OrderItem, Cart, CartItem, Coupon, Product


def get_delivery_fee(subtotal: Decimal, delivery_zone: str) -> Decimal:
    """
    Base fee BDT 50 city, BDT 100 suburbs, BDT 150+ other.
    Delivery fee waived for orders above BDT 500.
    """
    if subtotal >= FREE_DELIVERY_ABOVE_BDT:
        return Decimal("0")
    return DELIVERY_FEES.get(delivery_zone, DELIVERY_FEES[DELIVERY_ZONE_OTHER])


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


def get_cart_subtotal(cart) -> Decimal:
    """Sum of (price_at_order * quantity) for all cart items."""
    total = Decimal("0")
    for item in cart.items.select_related("product").all():
        total += item.price_at_order * item.quantity
    return total


def get_delivery_fee_for_subtotal(subtotal: Decimal, delivery_zone: str = None) -> Decimal:
    """Delivery fee by zone; waived above FREE_DELIVERY_ABOVE_BDT. If no zone, use default."""
    if subtotal >= FREE_DELIVERY_ABOVE_BDT:
        return Decimal("0")
    if delivery_zone:
        return DELIVERY_FEES.get(delivery_zone, DELIVERY_FEES[DELIVERY_ZONE_OTHER])
    return DEFAULT_DELIVERY_FEE_BDT


def validate_and_apply_coupon(code: str, subtotal: Decimal):
    """
    Validate coupon and return discount amount (Decimal).
    Returns (discount_amount, error_message). discount_amount is 0 if invalid.
    """
    if not (code or "").strip():
        return Decimal("0"), None
    code = code.strip().upper()
    try:
        coupon = Coupon.objects.get(code=code, is_active=True)
    except Coupon.DoesNotExist:
        return Decimal("0"), "Invalid or expired coupon code."
    now = timezone.now()
    if coupon.valid_from and now < coupon.valid_from:
        return Decimal("0"), "Coupon not yet valid."
    if coupon.valid_until and now > coupon.valid_until:
        return Decimal("0"), "Coupon has expired."
    if coupon.min_order_amount is not None and subtotal < coupon.min_order_amount:
        return Decimal("0"), f"Minimum order amount ৳{coupon.min_order_amount} required."
    if coupon.max_uses is not None and coupon.times_used >= coupon.max_uses:
        return Decimal("0"), "Coupon usage limit reached."
    if coupon.discount_type == Coupon.DiscountType.PERCENT:
        discount = (subtotal * coupon.discount_value / Decimal("100")).quantize(Decimal("0.01"))
    else:
        discount = min(coupon.discount_value, subtotal)
    return discount, None


def get_cart_summary(cart, delivery_zone: str = None, coupon_code: str = None):
    """
    Return dict: subtotal, delivery_fee, discount, total, coupon_error.
    """
    subtotal = get_cart_subtotal(cart)
    delivery_fee = get_delivery_fee_for_subtotal(subtotal, delivery_zone)
    discount = Decimal("0")
    coupon_error = None
    if coupon_code:
        discount, coupon_error = validate_and_apply_coupon(coupon_code, subtotal)
    total = (subtotal + delivery_fee - discount).quantize(Decimal("0.01"))
    return {
        "subtotal": subtotal,
        "delivery_fee": delivery_fee,
        "discount": discount,
        "total": total,
        "coupon_error": coupon_error,
    }


def format_address_from_user_address(addr) -> str:
    """Build shipping_address text from UserAddress instance."""
    gender = (addr.get_gender_display() if addr.gender else "") if hasattr(addr, "gender") else ""
    parts = [
        getattr(addr, "full_name", "") or "",
        getattr(addr, "email", "") or "",
        getattr(addr, "phone", "") or "",
        f"Gender: {gender}",
        f"District: {getattr(addr, 'district', '') or ''}",
        f"Thana: {getattr(addr, 'thana', '') or ''}",
        getattr(addr, "address", "") or "",
    ]
    return "\n".join(p for p in parts if p and str(p).strip())


def create_order_from_cart(user, cart, shipping_address_id, coupon_code=None, notes=None):
    """
    Create order from cart; use UserAddress for shipping text. Decrement stock, clear cart, apply coupon.
    Returns (order, error_message). error_message is None on success.
    """
    from authentication.models import UserAddress

    try:
        addr = UserAddress.objects.get(pk=shipping_address_id, user=user)
    except UserAddress.DoesNotExist:
        return None, "Shipping address not found or not yours."

    items = list(cart.items.select_related("product").all())
    if not items:
        return None, "Cart is empty."

    subtotal = get_cart_subtotal(cart)
    delivery_fee = get_delivery_fee_for_subtotal(subtotal)
    discount = Decimal("0")
    coupon_obj = None
    if coupon_code:
        discount, err = validate_and_apply_coupon(coupon_code, subtotal)
        if err:
            return None, err
        if discount > 0:
            coupon_obj = Coupon.objects.get(code=coupon_code.strip().upper(), is_active=True)

    if subtotal < MIN_ORDER_BDT:
        return None, f"Minimum order amount is ৳{MIN_ORDER_BDT}."

    total = (subtotal + delivery_fee - discount).quantize(Decimal("0.01"))
    shipping_text = format_address_from_user_address(addr)

    order = Order.objects.create(
        user=user,
        status=Order.Status.PENDING,
        total=total,
        shipping_address=shipping_text,
        notes=notes or "",
    )

    for item in items:
        product = item.product
        qty = item.quantity
        if product.quantity_in_stock < qty:
            order.delete()
            return None, f"Insufficient stock for {product.name}. Available: {product.quantity_in_stock}."
        OrderItem.objects.create(order=order, product=product, quantity=qty, price_at_order=item.price_at_order)
        product.quantity_in_stock -= qty
        product.save(update_fields=["quantity_in_stock"])

    cart.items.all().delete()

    if coupon_obj:
        coupon_obj.times_used += 1
        coupon_obj.save(update_fields=["times_used"])

    return order, None
