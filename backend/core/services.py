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
    PRICE_LOCK_HOURS,
    PAYMENT_FEE_RATES,
    PAYMENT_METHOD_COD,
)
from .models import Order


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
    return order.status in (Order.Status.PLACED, Order.Status.VERIFIED, Order.Status.PACKED)
