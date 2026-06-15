"""
Core API views with RBAC.
"""
import logging
import json
import uuid
from collections import defaultdict
from decimal import Decimal, InvalidOperation
from datetime import timedelta
from urllib.parse import urlencode
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Q
from django.db.models.deletion import ProtectedError
from django.http import HttpResponseRedirect
from django.utils import timezone
from rest_framework import status, viewsets, mixins, serializers
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter, inline_serializer, OpenApiResponse
from drf_spectacular.types import OpenApiTypes

from authentication.permissions import (
    IsSuperAdmin,
    IsPharmacyAdminOrSuper,
    IsDoctorOrSuper,
    IsRegisteredUser,
    IsRegisteredUserOnly,
    IsOwnerOrReadOnly,
    AllowAnyIncludingGuest,
)
from authentication.constants import UserRole

from .models import Brand, Category, DeliveryMethod, Ingredient, Unit, Product, ProductImage, ProductDosage, ProductReview, ProductReviewImage, Order, OrderImage, OrderItem, OrderStatusHistory, Prescription, PrescriptionImage, PrescriptionItem, PrescriptionStatusHistory, Consultation, UserNotification, UserNotificationPreference, UserPushSubscription, BlogCategory, BlogPost, Page, Cart, CartItem, Coupon, SidebarCategory, Ad, Combo, AppLogo, PaymentTransaction, NotificationCampaign, NotificationDeliveryLog, WishlistItem
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    CategoryTreeSerializer,
    CategoryMenuSerializer,
    CategorySelectionUpdateSerializer,
    ProductLinkCategorySerializer,
    IngredientSerializer,
    UnitSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductWriteSerializer,
    ProductImageSerializer,
    ProductImageCreateSerializer,
    ProductDosageSerializer,
    ProductDosageCreateSerializer,
    InventoryProductSerializer,
    OrderSerializer,
    OrderWriteSerializer,
    OrderStatusSerializer,
    DeliveryMethodSerializer,
    CartSerializer,
    CartItemSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer,
    PlaceOrderFromCartSerializer,
    CouponSerializer,
    CouponCreateUpdateSerializer,
    CouponValidateRequestSerializer,
    CouponValidateResponseSerializer,
    PrescriptionSerializer,
    PrescriptionUploadSerializer,
    PrescriptionVerifySerializer,
    ConsultationSerializer,
    ConsultationRequestSerializer,
    ConsultationResponseSerializer,
    UserNotificationSerializer,
    UserNotificationPreferenceSerializer,
    UserNotificationPreferenceUpdateSerializer,
    UserPushSubscriptionSerializer,
    UserPushSubscriptionUpsertSerializer,
    UserPushSubscriptionDeleteSerializer,
    AdminBroadcastNotificationSerializer,
    NotificationCampaignCreateSerializer,
    NotificationCampaignSerializer,
    NotificationDeliveryLogSerializer,
    NotificationHealthSerializer,
    NotificationMarkedCountSerializer,
    NotificationRemovedCountSerializer,
    NotificationBroadcastResultSerializer,
    NotificationTestSendSerializer,
    PageSerializer,
    BlogCategorySerializer,
    BlogPostSerializer,
    SidebarCategorySerializer,
    AdSerializer,
    ComboSerializer,
    AppLogoSerializer,
    ProductReviewSerializer,
    ProductReviewCreateSerializer,
    ProductReviewImageSerializer,
    OrderSettlementSerializer,
    SettlementCashDepositSerializer,
    SettlementPayoutSerializer,
    B2BCustomerProfileSerializer,
    B2BCommissionEntrySerializer,
    BuyNowPreviewSerializer,
    BuyNowSerializer,
    WishlistItemSerializer,
    WishlistItemCreateSerializer,
)
from .services import (
    get_or_create_cart,
    get_cart_summary,
    validate_coupon,
    get_delivery_zone_for_district,
    validate_min_order,
    update_product_review_aggregates,
    get_buy_now_summary,
)

from .tasks import dispatch_web_push_notifications
from .notification_service import create_and_dispatch_campaign, send_user_event_notification
from .filters import ProductFilter
from .models import OrderSettlement, B2BCustomerProfile, B2BCommissionEntry

logger = logging.getLogger(__name__)


ONLINE_PAYMENT_METHODS = {
    PaymentTransaction.Method.BKASH,
    PaymentTransaction.Method.NAGAD,
    PaymentTransaction.Method.ROCKET,
    PaymentTransaction.Method.UPAY,
    PaymentTransaction.Method.CARD,
    PaymentTransaction.Method.ONLINE,
}


def _normalize_payment_method(raw_method: str) -> str:
    method = (raw_method or PaymentTransaction.Method.COD).strip().upper()
    valid = {choice for choice, _ in PaymentTransaction.Method.choices}
    return method if method in valid else PaymentTransaction.Method.COD


def _is_online_payment_method(method: str) -> bool:
    return method in ONLINE_PAYMENT_METHODS


def _get_sslcommerz_client():
    if not settings.SSLCOMMERZ_STORE_ID or not settings.SSLCOMMERZ_STORE_PASS:
        raise ValueError("SSLCommerz credentials are missing in environment variables.")
    try:
        from sslcommerz_lib import SSLCOMMERZ
    except Exception as exc:
        raise ValueError(f"sslcommerz-lib is not installed or failed to import: {exc}") from exc
    ssl_settings = {
        "store_id": settings.SSLCOMMERZ_STORE_ID,
        "store_pass": settings.SSLCOMMERZ_STORE_PASS,
        "issandbox": settings.SSLCOMMERZ_IS_SANDBOX,
    }
    return SSLCOMMERZ(ssl_settings)


def _build_ssl_backend_url(path_suffix: str) -> str:
    base_url = (settings.SSLCOMMERZ_CALLBACK_BASE_URL or "").strip().rstrip("/")
    if not base_url:
        raise ValueError("SSLCOMMERZ_CALLBACK_BASE_URL is not configured.")
    return f"{base_url}/api/payments/sslcommerz/{path_suffix.strip('/')}/"


def _build_frontend_redirect(status_value: str, order_id: int = None) -> str:
    base_url = (settings.SSLCOMMERZ_FRONTEND_BASE_URL or "").strip().rstrip("/")
    if not base_url:
        return ""
    if status_value == "success" and order_id:
        return f"{base_url}/user/orders/{order_id}"
    params = {"payment_status": status_value}
    if order_id:
        params["order_id"] = str(order_id)
    return f"{base_url}/checkout?{urlencode(params)}"


def _ssl_multi_card_name(method: str) -> str:
    method_map = {
        PaymentTransaction.Method.BKASH: "bkash",
        PaymentTransaction.Method.NAGAD: "nagad",
        PaymentTransaction.Method.ROCKET: "rocket",
        PaymentTransaction.Method.UPAY: "upay",
        PaymentTransaction.Method.CARD: "visacard,mastercard,amexcard",
    }
    return method_map.get(method, "")


def _mark_payment_result(payment_txn: PaymentTransaction, status_value: str, payload: dict, verification_response=None):
    previous_status = payment_txn.status
    payment_txn.status = status_value
    payment_txn.gateway_response = payload or {}
    if payload.get("val_id"):
        payment_txn.val_id = str(payload.get("val_id"))
    if payload.get("bank_tran_id"):
        payment_txn.bank_tran_id = str(payload.get("bank_tran_id"))
    if payload.get("card_type"):
        payment_txn.card_type = str(payload.get("card_type"))
    if verification_response is not None:
        payment_txn.verified_response = verification_response
        payment_txn.verified_at = timezone.now()
    payment_txn.save()

    if not payment_txn.order_id:
        return
    settlement = OrderSettlement.objects.filter(order=payment_txn.order).first()
    if not settlement:
        return
    if status_value in (PaymentTransaction.Status.SUCCESS, PaymentTransaction.Status.IPN_VERIFIED):
        settlement.payment_method = OrderSettlement.PaymentMethod.ONLINE
        settlement.payment_status = OrderSettlement.PaymentStatus.PAID
    elif status_value == PaymentTransaction.Status.CANCELLED:
        settlement.payment_status = OrderSettlement.PaymentStatus.PENDING
        settlement.status = OrderSettlement.Status.CANCELLED
    elif status_value == PaymentTransaction.Status.FAILED:
        settlement.payment_status = OrderSettlement.PaymentStatus.PENDING
    settlement.updated_at = timezone.now()
    settlement.save()

    # Event notification to end user when payment status changes.
    if payment_txn.user_id and previous_status != status_value:
        status_label = status_value.replace("_", " ").title()
        send_user_event_notification(
            user_id=payment_txn.user_id,
            title=f"Payment {status_label}",
            message=f"Your payment status is now {status_label}.",
            target_url=(f"/user/orders/{payment_txn.order_id}" if payment_txn.order_id else "/checkout"),
            source="payment_event",
            dedupe_key=f"payment:{payment_txn.id}:{status_value}",
            metadata={
                "payment_transaction_id": payment_txn.id,
                "status": status_value,
                "order_id": payment_txn.order_id,
            },
        )


def _create_order_from_payment_transaction(payment_txn: PaymentTransaction):
    """
    Mark the pre-existing order's settlement as PAID after successful payment verification.
    Orders are now created at checkout time (before payment), so this function just updates
    the payment status. Idempotent: safe to call multiple times.

    Returns the linked order, or None if no order is linked.
    """
    if not payment_txn.order_id:
        return None

    order = payment_txn.order
    settlement = OrderSettlement.objects.filter(order=order).first()
    if settlement and settlement.payment_status != OrderSettlement.PaymentStatus.PAID:
        settlement.payment_method = OrderSettlement.PaymentMethod.ONLINE
        settlement.payment_status = OrderSettlement.PaymentStatus.PAID
        settlement.updated_at = timezone.now()
        settlement.save(update_fields=["payment_method", "payment_status", "updated_at"])

    return order


def _extract_payload(request):
    payload = {}
    if hasattr(request, "data"):
        try:
            payload = dict(request.data)
        except Exception:
            payload = {}
    if not payload:
        payload = request.query_params.dict()
    # QueryDict values can come as list wrappers.
    normalized = {}
    for key, value in payload.items():
        if isinstance(value, (list, tuple)):
            normalized[key] = value[0] if value else ""
        else:
            normalized[key] = value
    return normalized


def _extract_validation_status(verification_response):
    if isinstance(verification_response, list) and verification_response:
        item = verification_response[0]
        if isinstance(item, dict):
            return (item.get("status") or "").upper()
    if isinstance(verification_response, dict):
        return (verification_response.get("status") or "").upper()
    return ""


def _extract_verification_payload(verification_response):
    """Normalize SSLCommerz verification response to a dict payload."""
    if isinstance(verification_response, list) and verification_response:
        item = verification_response[0]
        return item if isinstance(item, dict) else {}
    if isinstance(verification_response, dict):
        return verification_response
    return {}


def _verify_payment_amount_matches(payment_txn: PaymentTransaction, verification_response) -> bool:
    """
    Ensure verified gateway amount/currency match the initiated transaction.
    Prevents creating orders for mismatched callback amounts.
    """
    payload = _extract_verification_payload(verification_response)
    gateway_amount_raw = (
        payload.get("amount")
        or payload.get("currency_amount")
        or payload.get("store_amount")
    )
    if gateway_amount_raw in (None, ""):
        return False

    try:
        gateway_amount = Decimal(str(gateway_amount_raw)).quantize(Decimal("0.01"))
        expected_amount = Decimal(str(payment_txn.amount or "0")).quantize(Decimal("0.01"))
    except (InvalidOperation, ValueError, TypeError):
        return False

    currency = (payload.get("currency_type") or payment_txn.currency or "").upper()
    expected_currency = (payment_txn.currency or "BDT").upper()
    if currency and currency != expected_currency:
        return False

    return gateway_amount == expected_amount


# ---- Category (hierarchy: parent / children). List/tree: anyone; CRUD: Pharmacy Admin / Super ----
@extend_schema_view(
    list=extend_schema(tags=["Categories"], summary="List categories"),
    retrieve=extend_schema(tags=["Categories"], summary="Get a category by slug"),
    create=extend_schema(tags=["Categories"], summary="Create category (multipart for image)"),
    update=extend_schema(tags=["Categories"], summary="Update category (multipart for image)"),
    partial_update=extend_schema(tags=["Categories"], summary="Partial update category (multipart for image)"),
    destroy=extend_schema(tags=["Categories"], summary="Delete category"),
)
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.select_related("parent", "sidebar_category").prefetch_related("children").annotate(
        product_count=Count("products", filter=Q(products__is_active=True), distinct=True)
    ).all()
    serializer_class = CategorySerializer
    filterset_fields = ["is_active", "parent", "show_in_sidebar", "is_featured_home", "is_home_categoery", "forth_section"]
    search_fields = ["name", "slug"]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_permissions(self):
        if self.action in ("list", "retrieve", "tree"):
            return [AllowAnyIncludingGuest()]
        if self.action in ("sidebar", "featured", "sidebar_category", "featured_category") and self.request.method == "GET":
            return [AllowAnyIncludingGuest()]
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]

    def get_serializer_class(self):
        if self.action == "tree":
            return CategoryTreeSerializer
        if self.action in ("sidebar", "featured", "forth_section", "sidebar_category", "featured_category", "forth_section_category"):
            return CategorySelectionUpdateSerializer if self.request.method in ("PUT", "PATCH") else CategoryMenuSerializer
        return CategorySerializer

    @action(detail=False, methods=["get"], url_path="tree")
    def tree(self, request):
        """Return category hierarchy (root categories with nested children). ?parent__isnull=true for roots."""
        roots = Category.objects.filter(parent__isnull=True, is_active=True).prefetch_related("children").order_by("name")
        return Response(CategoryTreeSerializer(roots, many=True, context={"request": request}).data)

    def _list_sidebar_categories(self, request):
        sidebar_categories = (
            Category.objects.filter(is_active=True, show_in_sidebar=True)
            .annotate(product_count=Count("products", filter=Q(products__is_active=True), distinct=True))
            .order_by("sidebar_order", "name")
        )
        return Response(CategoryMenuSerializer(sidebar_categories, many=True, context={"request": request}).data)

    def _replace_sidebar_categories(self, request):
        serializer = CategorySelectionUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category_ids = serializer.validated_data["category_ids"]

        with transaction.atomic():
            Category.objects.filter(show_in_sidebar=True).update(show_in_sidebar=False, sidebar_order=0)
            for order, category_id in enumerate(category_ids):
                Category.objects.filter(id=category_id).update(show_in_sidebar=True, sidebar_order=order)

        sidebar_categories = (
            Category.objects.filter(id__in=category_ids, show_in_sidebar=True)
            .annotate(product_count=Count("products", filter=Q(products__is_active=True), distinct=True))
            .order_by("sidebar_order", "name")
        )
        return Response(CategoryMenuSerializer(sidebar_categories, many=True, context={"request": request}).data)

    def _list_featured_categories(self, request):
        featured_categories = (
            Category.objects.filter(is_active=True, is_featured_home=True)
            .annotate(product_count=Count("products", filter=Q(products__is_active=True), distinct=True))
            .order_by("featured_order", "name")
        )
        return Response(CategoryMenuSerializer(featured_categories, many=True, context={"request": request}).data)

    def _replace_featured_categories(self, request):
        serializer = CategorySelectionUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category_ids = serializer.validated_data["category_ids"]

        with transaction.atomic():
            Category.objects.filter(is_featured_home=True).update(is_featured_home=False, featured_order=0)
            for order, category_id in enumerate(category_ids):
                Category.objects.filter(id=category_id).update(is_featured_home=True, featured_order=order)

        featured_categories = (
            Category.objects.filter(id__in=category_ids, is_featured_home=True)
            .annotate(product_count=Count("products", filter=Q(products__is_active=True), distinct=True))
            .order_by("featured_order", "name")
        )
        return Response(CategoryMenuSerializer(featured_categories, many=True, context={"request": request}).data)

    def _list_forth_section_categories(self, request):
        categories = (
            Category.objects.filter(is_active=True, forth_section=True)
            .annotate(product_count=Count("products", filter=Q(products__is_active=True), distinct=True))
            .order_by("featured_order", "name")
        )
        return Response(CategoryMenuSerializer(categories, many=True, context={"request": request}).data)

    def _replace_forth_section_categories(self, request):
        serializer = CategorySelectionUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category_ids = serializer.validated_data["category_ids"]

        with transaction.atomic():
            Category.objects.filter(forth_section=True).update(forth_section=False)
            for category_id in category_ids:
                Category.objects.filter(id=category_id).update(forth_section=True)

        categories = (
            Category.objects.filter(id__in=category_ids, forth_section=True)
            .annotate(product_count=Count("products", filter=Q(products__is_active=True), distinct=True))
            .order_by("featured_order", "name")
        )
        return Response(CategoryMenuSerializer(categories, many=True, context={"request": request}).data)

    @extend_schema(
        methods=["GET"],
        tags=["Categories"],
        summary="List sidebar categories",
        responses=CategoryMenuSerializer(many=True),
    )
    @extend_schema(
        methods=["PUT"],
        tags=["Categories"],
        summary="Replace sidebar categories (admin)",
        request=CategorySelectionUpdateSerializer,
        responses=CategoryMenuSerializer(many=True),
    )
    @action(
        detail=False,
        methods=["get", "put"],
        url_path="sidebar",
        pagination_class=None,
        filter_backends=[],
    )
    def sidebar(self, request):
        """
        GET: public sidebar category list from existing Category rows.
        PUT: admin replaces sidebar selection with ordered category_ids.
        """
        if request.method == "GET":
            return self._list_sidebar_categories(request)
        return self._replace_sidebar_categories(request)

    @extend_schema(
        methods=["GET"],
        tags=["Categories"],
        summary="List sidebar-category categories",
        responses=CategoryMenuSerializer(many=True),
    )
    @extend_schema(
        methods=["PUT"],
        tags=["Categories"],
        summary="Replace sidebar-category categories (admin)",
        request=CategorySelectionUpdateSerializer,
        responses=CategoryMenuSerializer(many=True),
    )
    @action(
        detail=False,
        methods=["get", "put"],
        url_path="sidebar-category",
        pagination_class=None,
        filter_backends=[],
    )
    def sidebar_category(self, request):
        """
        Primary endpoint for sidebar-related existing category selection.
        GET: public list
        PUT: admin replace ordered selection
        """
        if request.method == "GET":
            return self._list_sidebar_categories(request)
        return self._replace_sidebar_categories(request)

    @extend_schema(
        methods=["GET"],
        tags=["Categories"],
        summary="List featured home categories",
        responses=CategoryMenuSerializer(many=True),
    )
    @extend_schema(
        methods=["PUT"],
        tags=["Categories"],
        summary="Replace featured home categories (admin)",
        request=CategorySelectionUpdateSerializer,
        responses=CategoryMenuSerializer(many=True),
    )
    @action(
        detail=False,
        methods=["get", "put"],
        url_path="featured",
        pagination_class=None,
        filter_backends=[],
    )
    def featured(self, request):
        """
        GET: public featured category list for home page.
        PUT: admin replaces featured selection with ordered category_ids.
        """
        if request.method == "GET":
            return self._list_featured_categories(request)
        return self._replace_featured_categories(request)

    @extend_schema(
        methods=["GET"],
        tags=["Categories"],
        summary="List featured-category categories",
        responses=CategoryMenuSerializer(many=True),
    )
    @extend_schema(
        methods=["PUT"],
        tags=["Categories"],
        summary="Replace featured-category categories (admin)",
        request=CategorySelectionUpdateSerializer,
        responses=CategoryMenuSerializer(many=True),
    )
    @action(
        detail=False,
        methods=["get", "put"],
        url_path="featured-category",
        pagination_class=None,
        filter_backends=[],
    )
    def featured_category(self, request):
        """
        Primary endpoint for home featured existing category selection.
        GET: public list
        PUT: admin replace ordered selection
        """
        if request.method == "GET":
            return self._list_featured_categories(request)
        return self._replace_featured_categories(request)

    @extend_schema(
        methods=["GET"],
        tags=["Categories"],
        summary="List forth section categories",
        responses=CategoryMenuSerializer(many=True),
    )
    @extend_schema(
        methods=["PUT"],
        tags=["Categories"],
        summary="Replace forth section categories (admin)",
        request=CategorySelectionUpdateSerializer,
        responses=CategoryMenuSerializer(many=True),
    )
    @action(
        detail=False,
        methods=["get", "put"],
        url_path="forth-section",
        pagination_class=None,
        filter_backends=[],
    )
    def forth_section_action(self, request):
        """
        GET: public forth section category list.
        PUT: admin replaces forth section selection with category_ids.
        """
        if request.method == "GET":
            return self._list_forth_section_categories(request)
        return self._replace_forth_section_categories(request)

    @extend_schema(
        methods=["GET"],
        tags=["Categories"],
        summary="List forth-section categories",
        responses=CategoryMenuSerializer(many=True),
    )
    @extend_schema(
        methods=["PUT"],
        tags=["Categories"],
        summary="Replace forth-section categories (admin)",
        request=CategorySelectionUpdateSerializer,
        responses=CategoryMenuSerializer(many=True),
    )
    @action(
        detail=False,
        methods=["get", "put"],
        url_path="forth-section-category",
        pagination_class=None,
        filter_backends=[],
    )
    def forth_section_category(self, request):
        """
        Primary endpoint for forth section category selection.
        GET: public list
        PUT: admin replace selection
        """
        if request.method == "GET":
            return self._list_forth_section_categories(request)
        return self._replace_forth_section_categories(request)

# ---- Brand (autocomplete for product search). List: any; write: Pharmacy Admin / Super ----
class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["is_active"]
    search_fields = ["name", "slug"]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAnyIncludingGuest()]
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]


# ---- Ingredient (generic search: map to branded products). List: any; write: Pharmacy Admin / Super ----
class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    filter_backends = [SearchFilter]
    search_fields = ["name", "slug"]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAnyIncludingGuest()]
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]


# ---- Unit (medicine packaging: strip, bottle, etc.). List: any; write: Pharmacy Admin / Super ----
class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["is_active"]
    search_fields = ["name", "slug"]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAnyIncludingGuest()]
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]


# ---- Product (catalog search & filter per PRODUCT_CATALOG.md). Inventory = quantity_in_stock ----
@extend_schema_view(
    list=extend_schema(
        tags=["Products"],
        summary="List products (search & filters)",
        parameters=[
            OpenApiParameter(name="search", type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, required=False),
            OpenApiParameter(name="category", type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, required=False, description="Category id OR slug OR name"),
            OpenApiParameter(name="brand_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=False),
            OpenApiParameter(name="ingredient_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=False),
            # Price range (legacy + aliases)
            OpenApiParameter(name="price_min", type=OpenApiTypes.NUMBER, location=OpenApiParameter.QUERY, required=False, description="Legacy: min price (>=)"),
            OpenApiParameter(name="price_max", type=OpenApiTypes.NUMBER, location=OpenApiParameter.QUERY, required=False, description="Legacy: max price (<=)"),
            OpenApiParameter(name="min_price", type=OpenApiTypes.NUMBER, location=OpenApiParameter.QUERY, required=False, description="Alias: min price (>=)"),
            OpenApiParameter(name="max_price", type=OpenApiTypes.NUMBER, location=OpenApiParameter.QUERY, required=False, description="Alias of available"),
            # Discount
            OpenApiParameter(name="discounted", type=OpenApiTypes.BOOL, location=OpenApiParameter.QUERY, required=False, description="true => original_price > price"),
            OpenApiParameter(name="discount_min", type=OpenApiTypes.NUMBER, location=OpenApiParameter.QUERY, required=False, description="Minimum discount percent (>=). Requires discounted product."),
            OpenApiParameter(name="discount_max", type=OpenApiTypes.NUMBER, location=OpenApiParameter.QUERY, required=False, description="Maximum discount percent (<=). Requires discounted product."),
            OpenApiParameter(name="requires_prescription", type=OpenApiTypes.BOOL, location=OpenApiParameter.QUERY, required=False),
            OpenApiParameter(name="is_generic", type=OpenApiTypes.BOOL, location=OpenApiParameter.QUERY, required=False, description="true => generic/unbranded product row"),
            OpenApiParameter(name="ordering", type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, required=False, description="price,-price,name,-name,created_at,-created_at"),
            OpenApiParameter(name="include_inactive", type=OpenApiTypes.BOOL, location=OpenApiParameter.QUERY, required=False, description="Admins only: include is_active=false products"),
        ],
    ),
)
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category", "brand", "ingredient", "unit").prefetch_related("images", "dosage_options").all()
    filterset_class = ProductFilter
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_serializer_class(self):
        if self.action in ("list",):
            return ProductListSerializer
        if self.action in ("retrieve",):
            return ProductDetailSerializer
        return ProductWriteSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve", "count_summary", "search"):
            return [AllowAnyIncludingGuest()]
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]

    def get_queryset(self):
        qs = super().get_queryset()
        include_inactive = self.request.query_params.get("include_inactive")
        # By default, hide inactive (soft-deleted) products from all callers, including pharmacy admin.
        # Explicitly pass ?include_inactive=1 to see everything (e.g. for back-office reports).
        if include_inactive in ("1", "true", "True", "yes"):
            return qs
        return qs.filter(is_active=True)

    def perform_destroy(self, instance):
        """Delete product; if protected by related objects, soft-delete instead."""
        try:
            instance.delete()
        except ProtectedError:
            # Product is referenced by OrderItem or PrescriptionItem (on_delete=PROTECT).
            # Keep historical data intact but hide from catalog and zero out stock.
            Product.objects.filter(pk=instance.pk).update(
                is_active=False,
                quantity_in_stock=0,
            )
            # Remove from any active carts so users can't order it any more.
            CartItem.objects.filter(product=instance).delete()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(ProductDetailSerializer(product, context={"request": request}).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(ProductDetailSerializer(product, context={"request": request}).data)

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    @extend_schema(
        methods=["POST"],
        tags=["Products"],
        summary="Link this product to a specific category",
        request=ProductLinkCategorySerializer,
        responses={200: "Category linked successfully"}
    )
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsPharmacyAdminOrSuper], url_path="link-category")
    def link_category(self, request, slug=None):
        """
        Link this product to a specific category from the admin panel.
        """
        product = self.get_object()
        serializer = ProductLinkCategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category_id = serializer.validated_data["category_id"]
        is_home_page_category = serializer.validated_data.get("is_home_page_category", False)
        
        product.category_id = category_id
        product.is_in_homepage = is_home_page_category
        product.save(update_fields=["category", "is_in_homepage", "updated_at"])
        
        return Response(
            {"detail": f"Successfully linked product {product.name} to category ID {category_id}."}, 
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["get", "post"], permission_classes=[IsAuthenticated, IsPharmacyAdminOrSuper], url_path="images")
    def images(self, request, slug=None):
        """GET: list gallery images. POST: add gallery image (multipart: image, optional order)."""
        product = self.get_object()
        if request.method == "GET":
            qs = product.images.all().order_by("order", "id")
            return Response(ProductImageSerializer(qs, many=True, context={"request": request}).data)
        serializer = ProductImageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        img = ProductImage.objects.create(
            product=product,
            image=serializer.validated_data["image"],
            order=serializer.validated_data.get("order", 0),
        )
        return Response(ProductImageSerializer(img, context={"request": request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"], permission_classes=[IsAuthenticated, IsPharmacyAdminOrSuper], url_path="images/(?P<image_pk>[^/.]+)")
    def delete_image(self, request, slug=None, image_pk=None):
        """Delete a gallery image by id."""
        product = self.get_object()
        img = ProductImage.objects.filter(product=product, pk=image_pk).first()
        if not img:
            return Response({"detail": "Image not found."}, status=status.HTTP_404_NOT_FOUND)
        img.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get", "post"], permission_classes=[IsAuthenticated, IsPharmacyAdminOrSuper], url_path="dosages")
    def dosages(self, request, slug=None):
        """GET: list dosage options. POST: add a dosage (body: dosage_label, optional order)."""
        product = self.get_object()
        if request.method == "GET":
            qs = product.dosage_options.all().order_by("order", "id")
            return Response(ProductDosageSerializer(qs, many=True).data)
        serializer = ProductDosageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        obj, created = ProductDosage.objects.get_or_create(
            product=product,
            dosage_label=data["dosage_label"].strip(),
            defaults={"order": data.get("order", 0)},
        )
        if not created:
            obj.order = data.get("order", obj.order)
            obj.save(update_fields=["order"])
        return Response(ProductDosageSerializer(obj).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"], permission_classes=[IsAuthenticated, IsPharmacyAdminOrSuper], url_path="dosages/(?P<dosage_pk>[^/.]+)")
    def delete_dosage(self, request, slug=None, dosage_pk=None):
        """Delete a dosage option by id."""
        product = self.get_object()
        dosage = ProductDosage.objects.filter(product=product, pk=dosage_pk).first()
        if not dosage:
            return Response({"detail": "Dosage not found."}, status=status.HTTP_404_NOT_FOUND)
        dosage.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated, IsPharmacyAdminOrSuper], url_path="inventory-list")
    def inventory_list(self, request):
        """GET: paginated list of products with inventory fields for pharmacy admin."""
        qs = Product.objects.select_related("category", "brand").all().order_by("-updated_at")
        include_inactive = request.query_params.get("include_inactive")
        if include_inactive not in ("1", "true", "True", "yes"):
            qs = qs.filter(is_active=True)
        qs = self.filter_queryset(qs)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = InventoryProductSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = InventoryProductSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated, IsPharmacyAdminOrSuper], url_path="inventory")
    def inventory(self, request, slug=None):
        """PATCH: update quantity_in_stock and/or low_stock_threshold."""
        product = self.get_object()
        qty = request.data.get("quantity_in_stock")
        threshold = request.data.get("low_stock_threshold")
        if qty is None and threshold is None:
            return Response(
                {"detail": "Provide at least one of quantity_in_stock or low_stock_threshold."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        updates = {}
        if qty is not None:
            try:
                qty = int(qty)
                if qty < 0:
                    raise ValueError("Must be non-negative.")
                updates["quantity_in_stock"] = qty
            except (TypeError, ValueError):
                return Response(
                    {"quantity_in_stock": "Must be a non-negative integer."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        if threshold is not None:
            try:
                threshold = int(threshold)
                if threshold < 0:
                    raise ValueError("Must be non-negative.")
                updates["low_stock_threshold"] = threshold
            except (TypeError, ValueError):
                return Response(
                    {"low_stock_threshold": "Must be a non-negative integer."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        if updates:
            Product.objects.filter(pk=product.pk).update(**updates, updated_at=timezone.now())
            product.refresh_from_db()
        return Response(ProductDetailSerializer(product, context={"request": request}).data)

    @extend_schema(
        methods=["GET"],
        tags=["Products"],
        summary="Get total product count and category-wise product count",
        responses={
            200: OpenApiTypes.OBJECT,
        }
    )
    @action(detail=False, methods=["get"], url_path="count-summary")
    def count_summary(self, request):
        """
        Returns the total count of active products and the count of active products per category.
        """
        total_products = Product.objects.filter(is_active=True).count()
        
        category_counts = Category.objects.filter(is_active=True).annotate(
            product_count=Count("products", filter=Q(products__is_active=True), distinct=True)
        ).values("id", "name", "slug", "product_count").order_by("-product_count")
        
        return Response({
            "total_products": total_products,
            "category_counts": list(category_counts)
        })

    @extend_schema(
        methods=["GET"],
        tags=["Products"],
        summary="Search products with smart relevance ranking, fuzzy Levenshtein corrections, and autocomplete",
        parameters=[
            OpenApiParameter(name="q", type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, required=False, description="Search query string"),
            OpenApiParameter(name="query", type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, required=False, description="Alias for q"),
            OpenApiParameter(name="autocomplete", type=OpenApiTypes.BOOL, location=OpenApiParameter.QUERY, required=False, description="Lightweight autocomplete suggest format"),
            OpenApiParameter(name="category", type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, required=False, description="Category id OR slug OR name"),
            OpenApiParameter(name="brand_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=False),
            OpenApiParameter(name="ingredient_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=False),
            OpenApiParameter(name="min_price", type=OpenApiTypes.NUMBER, location=OpenApiParameter.QUERY, required=False),
            OpenApiParameter(name="max_price", type=OpenApiTypes.NUMBER, location=OpenApiParameter.QUERY, required=False),
            OpenApiParameter(name="available", type=OpenApiTypes.BOOL, location=OpenApiParameter.QUERY, required=False),
            OpenApiParameter(name="discounted", type=OpenApiTypes.BOOL, location=OpenApiParameter.QUERY, required=False),
            OpenApiParameter(name="requires_prescription", type=OpenApiTypes.BOOL, location=OpenApiParameter.QUERY, required=False),
            OpenApiParameter(name="ordering", type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, required=False, description="price,-price,name,-name,created_at,-created_at"),
        ],
        responses={
            200: ProductListSerializer(many=True),
        }
    )
    @action(detail=False, methods=["get"], permission_classes=[AllowAnyIncludingGuest], url_path="search")
    def search(self, request):
        """
        Search products with relevance scoring and smart fallback modes.
        GET /api/products/search/
        """
        from django.db.models import Case, When, Value, IntegerField
        
        q = request.query_params.get("q", "").strip() or request.query_params.get("query", "").strip()
        autocomplete = request.query_params.get("autocomplete", "") in ("1", "true", "True", "yes")

        # Get base queryset of active products
        qs = self.get_queryset()

        if q:
            q_lower = q.lower()
            
            # Setup relevance ranking using DB-level annotations
            w_exact_name = When(name__iexact=q_lower, then=Value(10))
            w_starts_name = When(name__istartswith=q_lower, then=Value(8))
            w_exact_brand = When(brand__name__iexact=q_lower, then=Value(7))
            w_exact_ingredient = When(ingredient__name__iexact=q_lower, then=Value(7))
            w_contains_name = When(name__icontains=q_lower, then=Value(5))
            w_contains_ingredient = When(ingredient__name__icontains=q_lower, then=Value(4))
            w_contains_brand = When(brand__name__icontains=q_lower, then=Value(4))

            qs_matches = qs.filter(
                Q(name__icontains=q) |
                Q(brand__name__icontains=q) |
                Q(ingredient__name__icontains=q)
            )

            # Annotate with relevance rank
            qs_scored = qs_matches.annotate(
                search_rank=Case(
                    w_exact_name,
                    w_starts_name,
                    w_exact_brand,
                    w_exact_ingredient,
                    w_contains_name,
                    w_contains_ingredient,
                    w_contains_brand,
                    default=Value(0),
                    output_field=IntegerField()
                )
            )

            # Filter out any non-matches (rank = 0 shouldn't happen with our Q filter, but safe)
            qs_scored = qs_scored.filter(search_rank__gt=0)
            
            # If no direct matched results, try fuzzy Levenshtein distance <= 2 correction on product/brand/ingredient names
            if not qs_scored.exists() and len(q) >= 2:
                try:
                    import Levenshtein
                except ImportError:
                    Levenshtein = None

                if Levenshtein:
                    # Fetch minimal fields for all active products to calculate distance in memory
                    all_products = Product.objects.filter(is_active=True).only(
                        "id", "name", "brand__name", "ingredient__name"
                    ).select_related("brand", "ingredient")
                    
                    fuzzy_pks = []
                    for product in all_products:
                        name_dist = Levenshtein.distance(q_lower, product.name.lower())
                        brand_dist = Levenshtein.distance(q_lower, product.brand.name.lower()) if product.brand else 999
                        ing_dist = Levenshtein.distance(q_lower, product.ingredient.name.lower()) if product.ingredient else 999
                        
                        # Word-level fuzzy matches (for multi-word product/brand/ingredient names)
                        words_match = False
                        if len(q_lower) >= 2:
                            words_match = any(Levenshtein.distance(q_lower, w) <= 1 for w in product.name.lower().split())
                            if not words_match and product.brand:
                                words_match = any(Levenshtein.distance(q_lower, w) <= 1 for w in product.brand.name.lower().split())
                            if not words_match and product.ingredient:
                                words_match = any(Levenshtein.distance(q_lower, w) <= 1 for w in product.ingredient.name.lower().split())

                        if name_dist <= 2 or brand_dist <= 2 or ing_dist <= 2 or words_match:
                            fuzzy_pks.append(product.pk)
                    
                    if fuzzy_pks:
                        qs_scored = qs.filter(pk__in=fuzzy_pks).annotate(
                            search_rank=Value(2, output_field=IntegerField())
                        )
            
            # Apply relevance sorting
            qs = qs_scored.order_by("-search_rank", "-rating_avg", "-created_at")
        else:
            # If no query provided, default ordering by name
            qs = qs.order_by("name")

        # Now apply the standard catalog filters (category, brand, ingredient, price range, stock status, discounted, requires_prescription)
        qs = self.filter_queryset(qs)

        # Autocomplete Optimization (instantly returns lightweight suggest list)
        if autocomplete:
            suggestions = []
            # Slice results to 15 items maximum for autocompletion speed
            for product in qs[:15]:
                image_url = None
                if product.image:
                    image_url = product.image.url
                    # Safe build absolute media uri
                    if request:
                        image_url = request.build_absolute_uri(image_url)

                suggestions.append({
                    "id": product.id,
                    "name": product.name,
                    "slug": product.slug,
                    "price": str(product.price),
                    "original_price": str(product.original_price) if product.original_price else None,
                    "discount_percentage": product.discount_percentage,
                    "image_url": image_url,
                    "brand_name": product.brand.name if product.brand else None,
                    "category_name": product.category.name if product.category else None,
                    "generic_name": product.ingredient.name if product.ingredient else None,
                    "ingredient_name": product.ingredient.name if product.ingredient else None,
                    "dosage": product.dosage,
                    "requires_prescription": product.requires_prescription,
                    "quantity_in_stock": product.quantity_in_stock,
                })
            return Response(suggestions, status=status.HTTP_200_OK)

        # Full Search Mode: standard pagination and serialization
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = ProductListSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = ProductListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)



# ---- Order: Pharmacy/Super see all; User sees own. Purchase = create (RegisteredUserOnly) ----
@extend_schema_view(
    list=extend_schema(tags=["Orders"], summary="List orders"),
    retrieve=extend_schema(tags=["Orders"], summary="Get order by id"),
    create=extend_schema(tags=["Orders"], summary="Place order (multipart: images, message, duration)"),
    partial_update=extend_schema(tags=["Orders"], summary="Update order status/duration (admin)"),
    update=extend_schema(tags=["Orders"], summary="Update order status/duration (admin)"),
)
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["status", "is_seen"]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        qs = (
            Order.objects.select_related("user", "prescription", "delivery_method", "coupon", "settlement")
            .prefetch_related("items__product", "items__combo", "images", "status_history")
            .all()
        )
        role = getattr(self.request.user, "role", None)
        if role in (UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN):
            return qs
        return qs.filter(user=self.request.user)

    def get_permissions(self):
        if self.action in ("create", "buy_now"):
            return [IsAuthenticated(), IsRegisteredUserOnly()]
        return [IsAuthenticated(), IsRegisteredUser()]

    def get_serializer_class(self):
        if self.action == "create":
            return OrderWriteSerializer
        if self.action in ("partial_update", "update"):
            return OrderStatusSerializer
        if self.action == "buy_now_preview":
            return BuyNowPreviewSerializer
        if self.action == "buy_now":
            return BuyNowSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if "multipart" in (request.content_type or ""):
            items_raw = data.get("items")
            if isinstance(items_raw, str) and items_raw.strip():
                try:
                    data["items"] = json.loads(items_raw)
                except (ValueError, TypeError):
                    pass
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        for i, f in enumerate(request.FILES.getlist("images", [])):
            OrderImage.objects.create(order=order, image=f, order_display=i)
        OrderStatusHistory.objects.create(order=order, status=Order.Status.PENDING)
        return Response(
            OrderSerializer(order, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        previous_status = order.status
        role = getattr(request.user, "role", None)
        if role not in (UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN):
            return Response({"detail": "Only pharmacy admin or super admin can update order status."}, status=status.HTTP_403_FORBIDDEN)
        serializer = OrderStatusSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if "status" in request.data:
            OrderStatusHistory.objects.create(order=order, status=order.status)
            # When delivered, create a settlement record (idempotent) and optionally B2B commission entry.
            if order.status == Order.Status.DELIVERED:
                settlement, created = OrderSettlement.objects.get_or_create(
                    order=order,
                    defaults={
                        "gross_amount": order.total,
                        "net_payable": order.total,
                        "created_by": request.user,
                        "updated_by": request.user,
                    },
                )
                if not created:
                    OrderSettlement.objects.filter(pk=settlement.pk).update(updated_by=request.user)
                # B2B commission ledger (if user has active B2B profile)
                profile = B2BCustomerProfile.objects.filter(user=order.user, is_active=True).first()
                if profile:
                    # Commission calculated on product revenue (exclude delivery_fee when present)
                    base = max(Decimal("0"), (order.total or Decimal("0")) - (order.delivery_fee or Decimal("0")))
                    commission_amount = (base * (profile.commission_rate or Decimal("0"))).quantize(Decimal("0.01"))
                    B2BCommissionEntry.objects.get_or_create(
                        customer=profile,
                        order=order,
                        defaults={
                            "commission_rate": profile.commission_rate,
                            "commission_amount": commission_amount,
                            "status": B2BCommissionEntry.Status.PENDING,
                        },
                    )
            if previous_status != order.status:
                status_label = order.status.replace("_", " ").title()
                send_user_event_notification(
                    user_id=order.user_id,
                    title=f"Order Status: {status_label}",
                    message=f"Your order #{order.id} status changed to {status_label}.",
                    target_url=f"/user/orders/{order.id}",
                    source="order_event",
                    dedupe_key=f"order:{order.id}:{order.status}",
                    metadata={
                        "order_id": order.id,
                        "previous_status": previous_status,
                        "new_status": order.status,
                    },
                )
        order.refresh_from_db()
        qs = Order.objects.filter(pk=order.pk).prefetch_related("items__product", "items__combo", "images", "status_history").select_related("user", "prescription", "delivery_method")
        order = qs.get()
        return Response(OrderSerializer(order, context={"request": request}).data)

    def update(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    @action(detail=True, methods=["post"], url_path="pay")
    def pay(self, request, pk=None):
        """
        POST /api/orders/<id>/pay/ – Create a new SSLCommerz session for an unpaid online order.
        Body: { payment_method?: str }  (optional, defaults to ONLINE)
        Returns { gateway_url, tran_id } so the frontend can redirect to the payment page.
        """
        order = self.get_object()
        # Only the order owner can pay
        if order.user_id != request.user.id:
            return Response({"detail": "Not your order."}, status=status.HTTP_403_FORBIDDEN)

        settlement = OrderSettlement.objects.filter(order=order).first()
        if not settlement:
            return Response({"detail": "No settlement record found."}, status=status.HTTP_400_BAD_REQUEST)
        if settlement.payment_status == OrderSettlement.PaymentStatus.PAID:
            return Response({"detail": "This order is already paid."}, status=status.HTTP_400_BAD_REQUEST)
        if settlement.payment_method == OrderSettlement.PaymentMethod.COD:
            return Response({"detail": "COD orders do not require online payment."}, status=status.HTTP_400_BAD_REQUEST)

        raw_method = (request.data.get("payment_method") or "ONLINE").strip().upper()
        payment_method = _normalize_payment_method(raw_method)
        if not _is_online_payment_method(payment_method):
            payment_method = PaymentTransaction.Method.ONLINE

        try:
            # Parse shipping address for customer details
            parts = (order.shipping_address or "").split(",")
            customer_name = (request.user.username or request.user.email or "Customer").strip()[:50]
            customer_email = (request.user.email or (parts[1].strip() if len(parts) > 1 else "") or "customer@example.com").strip()
            customer_phone = (request.user.phone or (parts[2].strip() if len(parts) > 2 else "") or "").strip() or "01700000000"
            product_names = ", ".join(
                [_order_item_display_name(oi) for oi in order.items.select_related("product", "combo").all()[:3]]
            ) or "Pharmacy Order"

            sslcz = _get_sslcommerz_client()
            tran_id = f"PAY-{request.user.id}-{uuid.uuid4().hex[:20].upper()}"
            total_payable = Decimal(str(order.total)).quantize(Decimal("0.01"))
            multi_card_name = _ssl_multi_card_name(payment_method)

            post_body = {
                "total_amount": str(total_payable),
                "currency": "BDT",
                "tran_id": tran_id,
                "success_url": _build_ssl_backend_url("success"),
                "fail_url": _build_ssl_backend_url("fail"),
                "cancel_url": _build_ssl_backend_url("cancel"),
                "ipn_url": _build_ssl_backend_url("ipn"),
                "emi_option": 0,
                "cus_name": customer_name,
                "cus_email": customer_email,
                "cus_phone": customer_phone,
                "cus_add1": (parts[-1].strip() if parts else "")[:255],
                "cus_city": (parts[-2].strip() if len(parts) > 1 else "Dhaka")[:50],
                "cus_country": "Bangladesh",
                "shipping_method": "NO",
                "num_of_item": order.items.count() or 1,
                "product_name": product_names[:255],
                "product_category": "Pharmacy",
                "product_profile": "general",
                "value_a": str(request.user.id),
                "value_b": str(order.id),
            }
            if multi_card_name:
                post_body["multi_card_name"] = multi_card_name

            session_response = sslcz.createSession(post_body)
            gateway_url = (session_response or {}).get("GatewayPageURL")
            if not gateway_url:
                raise ValueError((session_response or {}).get("failedreason") or "GatewayPageURL missing.")

            PaymentTransaction.objects.create(
                user=request.user,
                order=order,
                method=payment_method,
                amount=total_payable,
                currency="BDT",
                tran_id=tran_id,
                session_key=(session_response or {}).get("sessionkey", ""),
                gateway_url=gateway_url,
                status=PaymentTransaction.Status.INITIATED,
                shipping_address=order.shipping_address or "",
                notes=order.notes or "",
                subtotal_before_discount=order.subtotal_before_discount or Decimal("0"),
                discount_amount=order.discount_amount or Decimal("0"),
                delivery_fee=order.delivery_fee or Decimal("0"),
                coupon_id_ref=getattr(order.coupon, "id", None),
                delivery_method_id_ref=getattr(order.delivery_method, "id", None),
                cart_snapshot=[],
                request_payload=post_body,
                gateway_response=session_response or {},
            )

            return Response(
                {
                    "gateway_url": gateway_url,
                    "tran_id": tran_id,
                    "payment_method": payment_method,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as exc:
            return Response(
                {"detail": f"Failed to initialize payment: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["post"], url_path="buy-now-preview")
    def buy_now_preview(self, request):
        """
        POST /api/orders/buy-now-preview/
        Preview order summary for direct single-product checkout.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data.get("quantity", 1)
        shipping_address_id = serializer.validated_data.get("shipping_address_id")
        coupon_code = (serializer.validated_data.get("coupon_code") or "").strip()
        delivery_method_id = serializer.validated_data.get("delivery_method_id")
        
        # Resolve delivery zone and address district
        delivery_zone = None
        if shipping_address_id:
            from authentication.models import UserAddress
            address = UserAddress.objects.filter(user=request.user, pk=shipping_address_id).first()
            if address:
                delivery_zone = get_delivery_zone_for_district(address.district)
                
        # Resolve delivery method
        delivery_method = None
        if delivery_method_id:
            delivery_method = DeliveryMethod.objects.filter(pk=delivery_method_id, is_active=True).first()
            if not delivery_method:
                return Response(
                    {"delivery_method_id": "Invalid or inactive delivery option."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
                
        # Resolve coupon and validate
        coupon = None
        if coupon_code:
            subtotal = product.price * quantity
            try:
                coupon, _ = validate_coupon(coupon_code, subtotal)
            except ValueError as e:
                return Response({"coupon_code": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
        summary = get_buy_now_summary(
            product=product,
            quantity=quantity,
            delivery_zone=delivery_zone,
            coupon=coupon,
            delivery_method=delivery_method,
        )
        return Response(summary, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="buy-now")
    def buy_now(self, request):
        """
        POST /api/orders/buy-now/
        Directly places an order for a single product bypassing the cart.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data.get("quantity", 1)
        dosage = (serializer.validated_data.get("dosage") or "").strip()
        shipping_address_id = serializer.validated_data["shipping_address_id"]
        coupon_code = (serializer.validated_data.get("coupon_code") or "").strip()
        notes = (serializer.validated_data.get("notes") or "").strip()
        message = (serializer.validated_data.get("message") or "").strip()
        delivery_method_id = serializer.validated_data.get("delivery_method_id")
        payment_method = serializer.validated_data.get("payment_method")
        prescription = serializer.validated_data.get("prescription")
        
        if quantity > product.quantity_in_stock:
            return Response(
                {"detail": f"Insufficient stock for {product.name}. Available: {product.quantity_in_stock}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        # Enforce prescription checks on Rx products
        if product.requires_prescription:
            if not prescription:
                return Response(
                    {"prescription": "Required when ordering prescription-only medicines. Upload and get approval first."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if prescription.user_id != request.user.id:
                return Response(
                    {"prescription": "You can only use your own approved prescription."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if prescription.status != Prescription.Status.APPROVED:
                return Response(
                    {"prescription": "Prescription must be in APPROVED status."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
                
            # Check if product matches prescription items
            rx_item = PrescriptionItem.objects.filter(prescription=prescription, product=product).first()
            if not rx_item:
                return Response(
                    {"prescription": f"{product.name} must be listed on the prescription."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if quantity > rx_item.quantity_prescribed:
                return Response(
                    {"prescription": f"Cannot exceed prescribed quantity ({rx_item.quantity_prescribed})."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        from authentication.models import UserAddress
        address = UserAddress.objects.filter(user=request.user, pk=shipping_address_id).first()
        if not address:
            return Response(
                {"shipping_address_id": "Address not found or not yours."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        shipping_text = f"{address.full_name}, {address.email}, {address.phone}, {address.district}, {address.thana}, {address.address}"
        
        delivery_method = None
        if delivery_method_id:
            delivery_method = DeliveryMethod.objects.filter(pk=delivery_method_id, is_active=True).first()
            if not delivery_method:
                return Response(
                    {"delivery_method_id": "Invalid or inactive delivery option."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
                
        delivery_zone = get_delivery_zone_for_district(address.district)
        
        coupon = None
        if coupon_code:
            subtotal = product.price * quantity
            try:
                coupon, _ = validate_coupon(coupon_code, subtotal)
            except ValueError as e:
                return Response({"coupon_code": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
        summary = get_buy_now_summary(
            product=product,
            quantity=quantity,
            delivery_zone=delivery_zone,
            coupon=coupon,
            delivery_method=delivery_method,
        )
        
        min_order_subtotal = summary.get("subtotal_before_discount") or summary["subtotal"]
        if not validate_min_order(min_order_subtotal):
            return Response(
                {
                    "detail": (
                        "Minimum order amount is ৳100. "
                        f"Subtotal before discount: ৳{min_order_subtotal}. "
                        f"Current subtotal: ৳{summary['subtotal']}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                status=Order.Status.PENDING,
                delivery_method=delivery_method,
                total=summary["total_payable"],
                subtotal_before_discount=summary.get("subtotal_before_discount") or summary.get("subtotal") or Decimal("0"),
                discount_amount=summary.get("discount_amount") or Decimal("0"),
                delivery_fee=summary.get("delivery_fee") or Decimal("0"),
                coupon=coupon,
                shipping_address=shipping_text,
                notes=notes,
                prescription=prescription,
            )
            
            # Apply coupon allocation logic to price_at_order if applicable
            coupon_discount = Decimal("0.00")
            if coupon:
                if coupon.discount_type == Coupon.DiscountType.PERCENT:
                    coupon_discount = ((product.price * quantity) * coupon.discount_value / Decimal("100")).quantize(Decimal("0.01"))
                else:
                    coupon_discount = min(coupon.discount_value, product.price * quantity)
            
            net_item_subtotal = max(Decimal("0.00"), (product.price * quantity) - coupon_discount)
            price_at_order = (net_item_subtotal / quantity).quantize(Decimal("0.01")) if quantity else Decimal("0.00")
            
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price_at_order=price_at_order,
                dosage=(dosage or "").strip()[:50],
            )
            
            product.quantity_in_stock -= quantity
            product.save(update_fields=["quantity_in_stock"])
            
            OrderStatusHistory.objects.get_or_create(order=order, status=Order.Status.PENDING)
            
            payment_method_norm = _normalize_payment_method(payment_method)
            is_online = _is_online_payment_method(payment_method_norm)
            OrderSettlement.objects.get_or_create(
                order=order,
                defaults={
                    "payment_method": OrderSettlement.PaymentMethod.ONLINE if is_online else OrderSettlement.PaymentMethod.COD,
                    "payment_status": OrderSettlement.PaymentStatus.PENDING,
                    "gross_amount": order.total,
                    "net_payable": order.total,
                    "status": OrderSettlement.Status.PENDING,
                },
            )
            
            if coupon:
                coupon.times_used += 1
                coupon.save(update_fields=["times_used"])

        if is_online:
            try:
                sslcz = _get_sslcommerz_client()
                tran_id = f"PAY-{request.user.id}-{uuid.uuid4().hex[:20].upper()}"
                customer_name = (request.user.username or request.user.email or "Customer").strip()[:50]
                customer_email = (request.user.email or getattr(address, "email", "") or "customer@example.com").strip()
                customer_phone = (request.user.phone or address.phone or "").strip() or "01700000000"
                product_names = product.name[:255]

                total_payable = Decimal(str(summary["total_payable"])).quantize(Decimal("0.01"))
                multi_card_name = _ssl_multi_card_name(payment_method_norm)
                post_body = {
                    "total_amount": str(total_payable),
                    "currency": "BDT",
                    "tran_id": tran_id,
                    "success_url": _build_ssl_backend_url("success"),
                    "fail_url": _build_ssl_backend_url("fail"),
                    "cancel_url": _build_ssl_backend_url("cancel"),
                    "ipn_url": _build_ssl_backend_url("ipn"),
                    "emi_option": 0,
                    "cus_name": customer_name,
                    "cus_email": customer_email,
                    "cus_phone": customer_phone,
                    "cus_add1": (address.address or "")[:255],
                    "cus_city": (address.district or "Dhaka")[:50],
                    "cus_country": "Bangladesh",
                    "shipping_method": "NO",
                    "num_of_item": 1,
                    "product_name": product_names[:255],
                    "product_category": "Pharmacy",
                    "product_profile": "general",
                    "value_a": str(request.user.id),
                    "value_b": str(shipping_address_id),
                }
                if multi_card_name:
                    post_body["multi_card_name"] = multi_card_name
                session_response = sslcz.createSession(post_body)
                gateway_url = (session_response or {}).get("GatewayPageURL")
                if not gateway_url:
                    raise ValueError((session_response or {}).get("failedreason") or "GatewayPageURL missing from SSLCommerz response.")

                PaymentTransaction.objects.create(
                    user=request.user,
                    order=order,
                    method=payment_method_norm,
                    amount=total_payable,
                    currency="BDT",
                    tran_id=tran_id,
                    session_key=(session_response or {}).get("sessionkey", ""),
                    gateway_url=gateway_url,
                    status=PaymentTransaction.Status.INITIATED,
                    shipping_address=shipping_text,
                    notes=notes,
                    subtotal_before_discount=summary.get("subtotal_before_discount") or summary.get("subtotal") or Decimal("0"),
                    discount_amount=summary.get("discount_amount") or Decimal("0"),
                    delivery_fee=summary.get("delivery_fee") or Decimal("0"),
                    coupon_id_ref=getattr(order.coupon, "id", None),
                    delivery_method_id_ref=getattr(order.delivery_method, "id", None),
                    cart_snapshot=[],
                    request_payload=post_body,
                    gateway_response=session_response or {},
                )

                return Response(
                    {
                        **OrderSerializer(order, context={"request": request}).data,
                        "payment_required": True,
                        "payment_method": payment_method_norm,
                        "payment_provider": "SSLCOMMERZ",
                        "gateway_url": gateway_url,
                        "tran_id": tran_id,
                    },
                    status=status.HTTP_201_CREATED,
                )
            except Exception as exc:
                return Response(
                    {
                        **OrderSerializer(order, context={"request": request}).data,
                        "payment_required": True,
                        "payment_init_failed": True,
                        "detail": f"Order placed but payment initialization failed: {exc}",
                    },
                    status=status.HTTP_201_CREATED,
                )

        return Response(
            {
                **OrderSerializer(order, context={"request": request}).data,
                "payment_required": False,
            },
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(tags=["Orders"], summary="Download order invoice PDF")
    @action(detail=True, methods=["get"], url_path="invoice")
    def invoice(self, request, pk=None):
        """
        GET /api/orders/<id>/invoice/ – Download the PDF invoice for the order.
        Only accessible by the order owner or staff/admin.
        """
        order = self.get_object()
        
        # Security check: order owner, super admin, or pharmacy admin only
        role = getattr(request.user, "role", None)
        if order.user_id != request.user.id and role not in (UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN):
            return Response({"detail": "Not authorized to view this invoice."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            from core.invoice_generator import generate_invoice_pdf
            from django.http import HttpResponse
            
            pdf_bytes = generate_invoice_pdf(order)
            
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="invoice_{order.id}.pdf"'
            return response
        except Exception as e:
            return Response({"detail": f"Failed to generate invoice PDF: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---- Delivery duration (admin CRUD) ----
@extend_schema_view(
    list=extend_schema(tags=["DeliveryMethods"], summary="List delivery durations"),
    retrieve=extend_schema(tags=["DeliveryMethods"], summary="Get a delivery duration"),
    create=extend_schema(tags=["DeliveryMethods"], summary="Create delivery duration (admin)"),
    update=extend_schema(tags=["DeliveryMethods"], summary="Update delivery duration (admin)"),
    partial_update=extend_schema(tags=["DeliveryMethods"], summary="Partial update delivery duration (admin)"),
    destroy=extend_schema(tags=["DeliveryMethods"], summary="Delete delivery duration (admin)"),
)
class DeliveryMethodViewSet(viewsets.ModelViewSet):
    queryset = DeliveryMethod.objects.all()
    serializer_class = DeliveryMethodSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]  # Any authenticated user can read (e.g. select when placing order)
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action in ("list", "retrieve"):
            user = getattr(self.request, "user", None)
            role = getattr(user, "role", None) if user and user.is_authenticated else None
            if role not in (UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN):
                return qs.filter(is_active=True)
        return qs


# ---- Coupons: admin CRUD + user validate ----
@extend_schema_view(
    list=extend_schema(tags=["Coupons"], summary="List coupons (admin)"),
    retrieve=extend_schema(tags=["Coupons"], summary="Get coupon by id (admin)"),
    create=extend_schema(tags=["Coupons"], summary="Create coupon (admin)"),
    update=extend_schema(tags=["Coupons"], summary="Update coupon (admin)"),
    partial_update=extend_schema(tags=["Coupons"], summary="Partial update coupon (admin)"),
    destroy=extend_schema(tags=["Coupons"], summary="Delete coupon (admin)"),
)
class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    permission_classes = [IsAuthenticated, IsPharmacyAdminOrSuper]
    filterset_fields = ["discount_type", "is_active"]
    search_fields = ["code"]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return CouponCreateUpdateSerializer
        return CouponSerializer

    @action(detail=False, methods=["post"], url_path="validate", permission_classes=[IsAuthenticated, IsRegisteredUser])
    @extend_schema(
        tags=["Coupons"],
        summary="Validate/apply coupon (user)",
        request=CouponValidateRequestSerializer,
        responses={200: CouponValidateResponseSerializer},
    )
    def validate_coupon_code(self, request):
        """Validate a coupon code and return discount amount for a subtotal."""
        ser = CouponValidateRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        code = (ser.validated_data.get("code") or "").strip()
        subtotal = ser.validated_data.get("subtotal")
        if subtotal is None:
            # If subtotal not sent, try to compute from cart
            cart = get_or_create_cart(request.user)
            items = cart.items.select_related("product", "combo").all()
            subtotal = sum((i.price_at_order * i.quantity for i in items), Decimal("0"))
        try:
            coupon, discount = validate_coupon(code, subtotal)
        except ValueError as e:
            return Response(
                {
                    "is_valid": False,
                    "code": (code or None),
                    "discount_amount": Decimal("0.00"),
                    "discount_display": None,
                    "message": str(e),
                },
                status=status.HTTP_200_OK,
            )
        # display
        if coupon.discount_type == Coupon.DiscountType.PERCENT:
            display = f"-{coupon.discount_value}%"
        else:
            display = f"-৳{coupon.discount_value}"
        return Response(
            {
                "is_valid": True,
                "code": coupon.code,
                "discount_amount": discount,
                "discount_display": display,
                "message": "Coupon applied.",
            },
            status=status.HTTP_200_OK,
        )


def _build_cart_product_demand(cart: Cart, item_overrides=None, extra_product=None, extra_combo=None, extra_quantity: int = 0):
    """
    Build required quantity by product across the cart, including combo lines.
    item_overrides: {cart_item_id: replacement_quantity}
    extra_product/extra_combo: additional quantity to simulate an add operation.
    """
    item_overrides = item_overrides or {}
    demand = defaultdict(int)
    items = (
        cart.items.select_related("product", "combo")
        .prefetch_related("combo__products")
        .all()
    )
    for item in items:
        qty = item_overrides.get(item.id, item.quantity)
        if qty <= 0:
            continue
        if item.product_id:
            demand[item.product_id] += qty
            continue
        if item.combo_id:
            for product_id in item.combo.products.values_list("id", flat=True):
                demand[product_id] += qty

    if extra_quantity > 0 and extra_product is not None:
        demand[extra_product.id] += extra_quantity
    if extra_quantity > 0 and extra_combo is not None:
        for product_id in extra_combo.products.values_list("id", flat=True):
            demand[product_id] += extra_quantity
    return demand


def _find_stock_error(demand):
    products = Product.objects.filter(id__in=demand.keys()).only("id", "name", "quantity_in_stock")
    for product in products:
        required = demand.get(product.id, 0)
        if required > product.quantity_in_stock:
            return f"Insufficient stock for {product.name}. Required: {required}, available: {product.quantity_in_stock}."
    return None


def _order_item_display_name(item) -> str:
    if item.product_id and item.product:
        return item.product.name
    if item.combo_id and item.combo:
        return item.combo.title
    return "Item"


# ---- Cart: one cart per user; add, update/remove items, summary, place order ----
@extend_schema_view(
    list=extend_schema(
        tags=["Cart"],
        summary="Get my cart",
        responses={200: CartSerializer},
    ),
    add=extend_schema(
        tags=["Cart"],
        summary="Add product or combo to cart",
        request=AddToCartSerializer,
        responses={201: CartSerializer},
    ),
    apply_coupon=extend_schema(
        tags=["Cart"],
        summary="Apply coupon to cart",
        request=inline_serializer(
            name="CartApplyCouponRequest",
            fields={
                "coupon_code": serializers.CharField(),
            },
        ),
        responses={200: CartSerializer},
    ),
    remove_coupon=extend_schema(
        tags=["Cart"],
        summary="Remove coupon from cart",
        request=None,
        responses={200: CartSerializer},
    ),
    place_order=extend_schema(
        tags=["Cart"],
        summary="Place order from cart",
        request=PlaceOrderFromCartSerializer,
        responses={201: OrderSerializer},
    ),
)
class CartViewSet(viewsets.GenericViewSet):
    """GET /api/cart/ – my cart with items and summary. POST add, POST place-order."""
    permission_classes = [IsAuthenticated, IsRegisteredUser]
    serializer_class = CartSerializer
    pagination_class = None

    @extend_schema(
        tags=["Cart"],
        summary="Get my cart",
        responses={200: OpenApiResponse(response=CartSerializer)},
    )
    def list(self, request, *args, **kwargs):
        cart = get_or_create_cart(request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="apply-coupon")
    def apply_coupon(self, request):
        """
        Persist coupon discount on cart items by updating CartItem.price_at_order.
        Body: { coupon_code: str }
        """
        cart = get_or_create_cart(request.user)
        code = (request.data.get("coupon_code") or "").strip()
        if not code:
            return Response({"coupon_code": "coupon_code is required."}, status=status.HTTP_400_BAD_REQUEST)

        items = cart.items.select_related("product", "combo").all()
        if not items.exists():
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure original_price_at_order is set
        for it in items:
            if it.original_price_at_order is None:
                it.original_price_at_order = it.price_at_order
                it.save(update_fields=["original_price_at_order"])

        original_subtotal = sum(((it.original_price_at_order or it.price_at_order) * it.quantity for it in items), Decimal("0"))
        try:
            coupon, discount_amount = validate_coupon(code, original_subtotal)
        except ValueError as e:
            return Response({"coupon_code": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if discount_amount <= 0 or original_subtotal <= 0:
            cart.coupon = coupon
            cart.save(update_fields=["coupon", "updated_at"])
            return Response(CartSerializer(cart, context={"request": request}).data)

        # Allocate discount across items proportional to original line totals.
        line_totals = []
        for it in items:
            lt = ((it.original_price_at_order or it.price_at_order) * it.quantity).quantize(Decimal("0.01"))
            line_totals.append(lt)

        allocated = []
        running = Decimal("0.00")
        for i, lt in enumerate(line_totals):
            if i == len(line_totals) - 1:
                d = (discount_amount - running).quantize(Decimal("0.01"))
            else:
                ratio = (lt / original_subtotal) if original_subtotal > 0 else Decimal("0")
                d = (discount_amount * ratio).quantize(Decimal("0.01"))
                running += d
            allocated.append(max(Decimal("0.00"), d))

        # Apply discounted unit price
        for it, lt, d in zip(items, line_totals, allocated):
            after = max(Decimal("0.00"), (lt - d).quantize(Decimal("0.01")))
            unit_after = (after / it.quantity).quantize(Decimal("0.01")) if it.quantity else Decimal("0.00")
            it.price_at_order = unit_after
            it.save(update_fields=["price_at_order"])

        cart.coupon = coupon
        cart.save(update_fields=["coupon", "updated_at"])
        cart.refresh_from_db()
        return Response(CartSerializer(cart, context={"request": request}).data)

    @action(detail=False, methods=["post"], url_path="remove-coupon")
    def remove_coupon(self, request):
        """Remove applied coupon and restore CartItem.price_at_order from original_price_at_order."""
        cart = get_or_create_cart(request.user)
        items = cart.items.select_related("combo").all()
        for it in items:
            # For combo items, restore to the combo's discounted price (not undiscounted original)
            if it.combo_id and it.combo is not None:
                it.price_at_order = it.combo.get_cart_price()
            elif it.original_price_at_order is not None:
                it.price_at_order = it.original_price_at_order
            it.save(update_fields=["price_at_order"])
        cart.coupon = None
        cart.save(update_fields=["coupon", "updated_at"])
        cart.refresh_from_db()
        return Response(CartSerializer(cart, context={"request": request}).data)

    @action(detail=False, methods=["post"], url_path="add")
    def add(self, request):
        """POST /api/cart/add/ - body: { product?: id, combo?: id, quantity: int, dosage?: str }.

        For combos, price_at_order is determined by Combo.get_cart_price() (discount_price > custom_price > sum of products).
        """
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data.get("product")
        combo = serializer.validated_data.get("combo")
        quantity = serializer.validated_data["quantity"]
        dosage = (serializer.validated_data.get("dosage") or "").strip()[:50]
        cart = get_or_create_cart(request.user)

        stock_demand = _build_cart_product_demand(
            cart=cart,
            extra_product=product,
            extra_combo=combo,
            extra_quantity=quantity,
        )
        stock_error = _find_stock_error(stock_demand)
        if stock_error:
            return Response({"detail": stock_error}, status=status.HTTP_400_BAD_REQUEST)

        if product:
            item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                combo=None,
                defaults={
                    "quantity": quantity,
                    "original_price_at_order": product.price,
                    "price_at_order": product.price,
                    "dosage": dosage,
                },
            )
            if not created:
                item.quantity += quantity
                item.dosage = dosage
                if item.original_price_at_order is None:
                    item.original_price_at_order = item.price_at_order
                item.save(update_fields=["quantity", "dosage", "original_price_at_order"])
        else:
            # Use model method which implements discount_price > custom_price > legacy product sum precedence
            combo_unit_price = combo.get_cart_price()
            item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=None,
                combo=combo,
                defaults={
                    "quantity": quantity,
                    "original_price_at_order": combo.get_cart_original_price(),
                    "price_at_order": combo_unit_price,
                    "dosage": "",
                },
            )
            if not created:
                item.quantity += quantity
                if item.original_price_at_order is None:
                    item.original_price_at_order = item.price_at_order
                item.save(update_fields=["quantity", "original_price_at_order"])

        cart.save(update_fields=["updated_at"])
        cart.refresh_from_db()
        return Response(CartSerializer(cart, context={"request": request}).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="place-order")
    def place_order(self, request):
        """POST /api/cart/place-order/ – body: { shipping_address_id: int, coupon_code?: str, notes?: str }."""
        cart = get_or_create_cart(request.user)
        serializer = PlaceOrderFromCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        address_id = serializer.validated_data["shipping_address_id"]
        coupon_code = (serializer.validated_data.get("coupon_code") or "").strip()
        notes = (serializer.validated_data.get("notes") or "").strip()
        delivery_method_id = serializer.validated_data.get("delivery_method_id")
        payment_method = _normalize_payment_method(serializer.validated_data.get("payment_method"))

        from authentication.models import UserAddress
        address = UserAddress.objects.filter(user=request.user, pk=address_id).first()
        if not address:
            return Response(
                {"shipping_address_id": "Address not found or not yours."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        shipping_text = f"{address.full_name}, {address.email}, {address.phone}, {address.district}, {address.thana}, {address.address}"
        delivery_method = None
        if delivery_method_id:
            delivery_method = DeliveryMethod.objects.filter(
                pk=delivery_method_id,
                is_active=True,
            ).first()
            if not delivery_method:
                return Response(
                    {"delivery_method_id": "Invalid or inactive delivery option."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        delivery_zone = get_delivery_zone_for_district(address.district)
        # Coupon can be provided or already applied/persisted to cart
        coupon = cart.coupon
        if coupon_code:
            # If a code is sent at checkout, validate and persist it first (so prices are saved).
            # Reuse apply_coupon logic by validating against original subtotal.
            items = cart.items.select_related("product", "combo").all()
            original_subtotal = sum(((i.original_price_at_order or i.price_at_order) * i.quantity for i in items), Decimal("0"))
            try:
                coupon, discount_amount = validate_coupon(coupon_code, original_subtotal)
            except ValueError as e:
                return Response({"coupon_code": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            cart.coupon = coupon
            cart.save(update_fields=["coupon", "updated_at"])
            # Apply prices if not already discounted
            if original_subtotal > 0 and discount_amount > 0:
                # allocate as in apply_coupon
                line_totals = [((i.original_price_at_order or i.price_at_order) * i.quantity).quantize(Decimal("0.01")) for i in items]
                allocated = []
                running = Decimal("0.00")
                for idx, lt in enumerate(line_totals):
                    if idx == len(line_totals) - 1:
                        d = (discount_amount - running).quantize(Decimal("0.01"))
                    else:
                        ratio = (lt / original_subtotal) if original_subtotal > 0 else Decimal("0")
                        d = (discount_amount * ratio).quantize(Decimal("0.01"))
                        running += d
                    allocated.append(max(Decimal("0.00"), d))
                for i, lt, d in zip(items, line_totals, allocated):
                    after = max(Decimal("0.00"), (lt - d).quantize(Decimal("0.01")))
                    unit_after = (after / i.quantity).quantize(Decimal("0.01")) if i.quantity else Decimal("0.00")
                    i.price_at_order = unit_after
                    if i.original_price_at_order is None:
                        i.original_price_at_order = i.price_at_order
                        i.save(update_fields=["price_at_order", "original_price_at_order"])
                    else:
                        i.save(update_fields=["price_at_order"])

        summary = get_cart_summary(
            cart,
            delivery_zone=delivery_zone,
            coupon=coupon,
            delivery_method=delivery_method,
        )
        min_order_subtotal = summary.get("subtotal_before_discount") or summary["subtotal"]
        if not validate_min_order(min_order_subtotal):
            return Response(
                {
                    "detail": (
                        "Minimum order amount is ৳100. "
                        f"Cart subtotal before discount: ৳{min_order_subtotal}. "
                        f"Current subtotal: ৳{summary['subtotal']}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        stock_demand = _build_cart_product_demand(cart)
        stock_error = _find_stock_error(stock_demand)
        if stock_error:
            return Response({"detail": stock_error}, status=status.HTTP_400_BAD_REQUEST)

        # ── Unified flow: create order FIRST for all payment methods ──
        cart_items = (
            cart.items.select_related("product", "combo")
            .prefetch_related("combo__products")
            .all()
        )
        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                status=Order.Status.PENDING,
                delivery_method=delivery_method,
                total=summary["total_payable"],
                subtotal_before_discount=summary.get("subtotal_before_discount") or summary.get("subtotal") or Decimal("0"),
                discount_amount=summary.get("discount_amount") or Decimal("0"),
                delivery_fee=summary.get("delivery_fee") or Decimal("0"),
                coupon=cart.coupon,
                shipping_address=shipping_text,
                notes=notes,
            )
            for item in cart_items:
                if item.product_id:
                    OrderItem.objects.create(
                        order=order,
                        product=item.product,
                        combo=None,
                        quantity=item.quantity,
                        price_at_order=item.price_at_order,
                        dosage=(item.dosage or "").strip()[:50],
                    )
                    continue

                if item.combo_id:
                    if not item.combo.products.exists():
                        combo_name = item.combo.title if item.combo else "Unknown combo"
                        raise ValidationError({"detail": f"Combo '{combo_name}' has no products. Please remove it from cart."})
                    OrderItem.objects.create(
                        order=order,
                        product=None,
                        combo=item.combo,
                        quantity=item.quantity,
                        price_at_order=item.price_at_order,
                        dosage="",
                    )

            for product_id, required_qty in stock_demand.items():
                product = Product.objects.select_for_update().filter(pk=product_id).first()
                if not product or required_qty > product.quantity_in_stock:
                    product_name = product.name if product else f"Product #{product_id}"
                    raise ValidationError({"detail": f"Insufficient stock for {product_name}."})
                product.quantity_in_stock -= required_qty
                product.save(update_fields=["quantity_in_stock"])

            OrderStatusHistory.objects.get_or_create(order=order, status=Order.Status.PENDING)

            is_online = _is_online_payment_method(payment_method)
            OrderSettlement.objects.get_or_create(
                order=order,
                defaults={
                    "payment_method": OrderSettlement.PaymentMethod.ONLINE if is_online else OrderSettlement.PaymentMethod.COD,
                    "payment_status": OrderSettlement.PaymentStatus.PENDING,
                    "gross_amount": order.total,
                    "net_payable": order.total,
                    "status": OrderSettlement.Status.PENDING,
                },
            )

            if cart.coupon:
                coupon.times_used += 1
                coupon.save(update_fields=["times_used"])

            cart.items.all().delete()
            cart.coupon = None
            cart.save(update_fields=["coupon", "updated_at"])

        # ── For online payments: create SSLCommerz session after order exists ──
        if is_online:
            try:
                sslcz = _get_sslcommerz_client()
                tran_id = f"PAY-{request.user.id}-{uuid.uuid4().hex[:20].upper()}"
                customer_name = (request.user.username or request.user.email or "Customer").strip()[:50]
                customer_email = (request.user.email or getattr(address, "email", "") or "customer@example.com").strip()
                customer_phone = (request.user.phone or address.phone or "").strip() or "01700000000"
                product_names = ", ".join(
                    [_order_item_display_name(oi) for oi in order.items.select_related("product", "combo").all()[:3]]
                ) or "Pharmacy Order"

                total_payable = Decimal(str(summary["total_payable"])).quantize(Decimal("0.01"))
                multi_card_name = _ssl_multi_card_name(payment_method)
                post_body = {
                    "total_amount": str(total_payable),
                    "currency": "BDT",
                    "tran_id": tran_id,
                    "success_url": _build_ssl_backend_url("success"),
                    "fail_url": _build_ssl_backend_url("fail"),
                    "cancel_url": _build_ssl_backend_url("cancel"),
                    "ipn_url": _build_ssl_backend_url("ipn"),
                    "emi_option": 0,
                    "cus_name": customer_name,
                    "cus_email": customer_email,
                    "cus_phone": customer_phone,
                    "cus_add1": (address.address or "")[:255],
                    "cus_city": (address.district or "Dhaka")[:50],
                    "cus_country": "Bangladesh",
                    "shipping_method": "NO",
                    "num_of_item": order.items.count() or 1,
                    "product_name": product_names[:255],
                    "product_category": "Pharmacy",
                    "product_profile": "general",
                    "value_a": str(request.user.id),
                    "value_b": str(address_id),
                }
                if multi_card_name:
                    post_body["multi_card_name"] = multi_card_name
                session_response = sslcz.createSession(post_body)
                gateway_url = (session_response or {}).get("GatewayPageURL")
                if not gateway_url:
                    raise ValueError((session_response or {}).get("failedreason") or "GatewayPageURL missing from SSLCommerz response.")

                PaymentTransaction.objects.create(
                    user=request.user,
                    order=order,
                    method=payment_method,
                    amount=total_payable,
                    currency="BDT",
                    tran_id=tran_id,
                    session_key=(session_response or {}).get("sessionkey", ""),
                    gateway_url=gateway_url,
                    status=PaymentTransaction.Status.INITIATED,
                    shipping_address=shipping_text,
                    notes=notes,
                    subtotal_before_discount=summary.get("subtotal_before_discount") or summary.get("subtotal") or Decimal("0"),
                    discount_amount=summary.get("discount_amount") or Decimal("0"),
                    delivery_fee=summary.get("delivery_fee") or Decimal("0"),
                    coupon_id_ref=getattr(order.coupon, "id", None),
                    delivery_method_id_ref=getattr(delivery_method, "id", None),
                    cart_snapshot=[],
                    request_payload=post_body,
                    gateway_response=session_response or {},
                )

                return Response(
                    {
                        **OrderSerializer(order, context={"request": request}).data,
                        "payment_required": True,
                        "payment_method": payment_method,
                        "payment_provider": "SSLCOMMERZ",
                        "gateway_url": gateway_url,
                        "tran_id": tran_id,
                    },
                    status=status.HTTP_201_CREATED,
                )
            except Exception as exc:
                # Order is already created; return it with a warning about payment init failure
                return Response(
                    {
                        **OrderSerializer(order, context={"request": request}).data,
                        "payment_required": True,
                        "payment_init_failed": True,
                        "detail": f"Order placed but payment initialization failed: {exc}",
                    },
                    status=status.HTTP_201_CREATED,
                )

        # COD flow: order already created above, just return it.
        return Response(
            {
                **OrderSerializer(order, context={"request": request}).data,
                "payment_required": False,
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema_view(
    partial_update=extend_schema(
        tags=["Cart"],
        summary="Update cart item quantity/dosage",
        request=UpdateCartItemSerializer,
        responses={200: CartItemSerializer, 204: None},
    ),
    destroy=extend_schema(
        tags=["Cart"],
        summary="Remove cart item",
        responses={204: None},
    ),
)
class CartItemViewSet(viewsets.GenericViewSet):
    """PATCH /api/cart/items/<id>/ – update quantity. DELETE – remove item."""
    permission_classes = [IsAuthenticated, IsRegisteredUser]
    serializer_class = CartItemSerializer

    def get_queryset(self):
        cart = get_or_create_cart(self.request.user)
        return (
            CartItem.objects.filter(cart=cart)
            .select_related("product", "product__unit", "combo")
            .prefetch_related("combo__products")
        )

    def partial_update(self, request, pk=None):
        item = self.get_object()
        serializer = UpdateCartItemSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        update_fields = []
        qty = serializer.validated_data.get("quantity")
        if qty is not None:
            if qty == 0:
                item.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            cart = get_or_create_cart(request.user)
            stock_demand = _build_cart_product_demand(cart=cart, item_overrides={item.id: qty})
            stock_error = _find_stock_error(stock_demand)
            if stock_error:
                return Response(
                    {
                        "detail": stock_error,
                        "quantity": stock_error,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.quantity = qty
            update_fields.append("quantity")
        if "dosage" in serializer.validated_data:
            if item.combo_id:
                return Response(
                    {"dosage": "Dosage is not applicable for combo cart items."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.dosage = (serializer.validated_data["dosage"] or "").strip()[:50]
            update_fields.append("dosage")
        if update_fields:
            item.save(update_fields=update_fields)
        return Response(CartItemSerializer(item, context={"request": request}).data)

    def destroy(self, request, pk=None):
        item = self.get_object()
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def _create_order_from_prescription(prescription):
    """When admin approves prescription with items: create Order so user has an order to track. Sets prescription to USED."""
    items = list(
        PrescriptionItem.objects.filter(prescription=prescription).select_related("product")
    )
    if not items:
        return
    shipping_text = ""
    if prescription.shipping_address:
        addr = prescription.shipping_address
        shipping_text = f"{addr.full_name}, {getattr(addr, 'email', '') or ''}, {addr.phone}, {addr.district}, {getattr(addr, 'thana', '') or ''}, {addr.address}"
    # Combine user/admin notes and additional products note into order notes
    combined_notes_parts = [
        (prescription.prescription_note or "").strip(),
        (prescription.additional_products_note or "").strip(),
        (prescription.notes or "").strip(),
    ]
    combined_notes = "\n\n".join([p for p in combined_notes_parts if p])
    order = Order.objects.create(
        user=prescription.user,
        prescription=prescription,
        status=Order.Status.CONFIRMED,
        shipping_address=shipping_text,
        notes=combined_notes,
        total=Decimal("0"),
    )
    total = Decimal("0")
    for pi in items:
        price = pi.product.price
        qty = pi.quantity_prescribed
        OrderItem.objects.create(
            order=order,
            product=pi.product,
            quantity=qty,
            price_at_order=price,
            dosage="",
        )
        total += price * qty
        pi.product.quantity_in_stock -= qty
        pi.product.save(update_fields=["quantity_in_stock"])
    order.total = total
    order.save(update_fields=["total"])
    prescription.status = Prescription.Status.USED
    prescription.save(update_fields=["status"])
    OrderStatusHistory.objects.create(order=order, status=Order.Status.CONFIRMED)


# ---- Prescription ordering: User upload (multipart + images); Admin full CRUD + verify + status timeline ----
@extend_schema_view(
    list=extend_schema(tags=["Prescriptions"], summary="List prescriptions"),
    retrieve=extend_schema(tags=["Prescriptions"], summary="Get prescription by id"),
    create=extend_schema(tags=["Prescriptions"], summary="Upload prescription order (multipart: images, address, duration, note)"),
    partial_update=extend_schema(tags=["Prescriptions"], summary="Verify/update prescription (admin)"),
    update=extend_schema(tags=["Prescriptions"], summary="Update prescription (admin)"),
    destroy=extend_schema(tags=["Prescriptions"], summary="Delete prescription (admin)"),
)
class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.select_related("user", "verified_by", "shipping_address").prefetch_related(
        "items__product", "images", "status_history"
    ).all()
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["status", "is_seen"]
    http_method_names = ["get", "post", "patch", "put", "delete", "head", "options"]

    def get_queryset(self):
        qs = super().get_queryset()
        role = getattr(self.request.user, "role", None)
        if role in (UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN):
            return qs
        return qs.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == "create":
            return PrescriptionUploadSerializer
        if self.action in ("verify", "partial_update", "update"):
            return PrescriptionVerifySerializer
        return PrescriptionSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated(), IsRegisteredUserOnly()]
        if self.action in ("partial_update", "update", "destroy", "verify"):
            return [IsAuthenticated(), IsPharmacyAdminOrSuper()]
        return [IsAuthenticated(), IsRegisteredUser()]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if "multipart" in (request.content_type or ""):
            for key in ("issue_date", "patient_name_on_rx", "doctor_name", "doctor_reg_number", "save_prescription", "medicine_supply_duration", "prescription_note", "shipping_address"):
                val = data.get(key)
                if val is not None and isinstance(val, str) and key == "issue_date" and val.strip():
                    pass  # keep as date string
                elif val is not None and isinstance(val, str) and key == "shipping_address" and val.strip().isdigit():
                    data[key] = int(val)
                elif val is not None and isinstance(val, str) and key == "save_prescription":
                    data[key] = val.lower() in ("true", "1", "yes")
                elif val is not None and isinstance(val, str) and key == "custom_supply_days" and val.strip().isdigit():
                    data["custom_supply_days"] = int(val)
            if "custom_supply_days" in request.data and "custom_supply_days" not in data:
                data["custom_supply_days"] = request.data.get("custom_supply_days")
        serializer = PrescriptionUploadSerializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        payload = {k: v for k, v in serializer.validated_data.items() if k != "file" or v is not None}
        if not payload.get("file") and request.FILES.get("file"):
            payload["file"] = request.FILES["file"]
        prescription = Prescription.objects.create(user=request.user, status=Prescription.Status.PENDING, **payload)
        for i, f in enumerate(request.FILES.getlist("images", [])):
            PrescriptionImage.objects.create(prescription=prescription, image=f, order_display=i)
        PrescriptionStatusHistory.objects.create(prescription=prescription, status=Prescription.Status.PENDING)
        return Response(
            PrescriptionSerializer(prescription, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        """Verify or reject prescription. PENDING -> APPROVED (with doctor details + items) or REJECTED."""
        prescription = self.get_object()
        previous_status = prescription.status
        serializer = PrescriptionVerifySerializer(prescription, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        prescription.status = data.get("status", prescription.status)
        prescription.is_seen = data.get("is_seen", prescription.is_seen)
        prescription.notes = data.get("notes", prescription.notes)
        prescription.doctor_name = data.get("doctor_name", prescription.doctor_name)
        prescription.doctor_reg_number = data.get("doctor_reg_number", prescription.doctor_reg_number)
        prescription.has_signature = data.get("has_signature", prescription.has_signature)
        prescription.patient_name_on_rx = data.get("patient_name_on_rx", prescription.patient_name_on_rx)
        prescription.verified_by = request.user
        prescription.verified_at = timezone.now()
        prescription.save(update_fields=["status", "is_seen", "notes", "doctor_name", "doctor_reg_number", "has_signature", "patient_name_on_rx", "verified_by", "verified_at", "updated_at"])
        if prescription.status == Prescription.Status.APPROVED and "items" in data and data["items"]:
            PrescriptionItem.objects.filter(prescription=prescription).delete()
            for entry in data["items"]:
                product_id = entry.get("product") if isinstance(entry.get("product"), int) else getattr(entry.get("product"), "id", None)
                qty = entry.get("quantity_prescribed")
                if product_id is not None and qty is not None and qty > 0:
                    PrescriptionItem.objects.create(
                        prescription=prescription,
                        product_id=product_id,
                        quantity_prescribed=qty,
                    )
            # Confirm order: create Order from prescription so user has an order to track
            _create_order_from_prescription(prescription)
        if "status" in request.data:
            PrescriptionStatusHistory.objects.create(prescription=prescription, status=prescription.status)
            if previous_status != prescription.status:
                status_label = prescription.status.replace("_", " ").title()
                send_user_event_notification(
                    user_id=prescription.user_id,
                    title=f"Prescription {status_label}",
                    message=f"Your prescription #{prescription.id} is now {status_label}.",
                    target_url="/user/prescriptions",
                    source="prescription_event",
                    dedupe_key=f"prescription:{prescription.id}:{prescription.status}",
                    metadata={
                        "prescription_id": prescription.id,
                        "previous_status": previous_status,
                        "new_status": prescription.status,
                    },
                )
        prescription.refresh_from_db()
        qs = Prescription.objects.filter(pk=prescription.pk).select_related("user", "verified_by", "shipping_address").prefetch_related("items__product", "images", "status_history")
        prescription = qs.get()
        return Response(PrescriptionSerializer(prescription, context={"request": request}).data)

    def update(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Admin only: delete prescription."""
        prescription = self.get_object()
        prescription.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated, IsPharmacyAdminOrSuper], url_path="verify")
    def verify(self, request, **kwargs):
        """Alias for PATCH prescription (verify/reject)."""
        return self.partial_update(request, **kwargs)


@extend_schema_view(
    create=extend_schema(
        tags=["Prescriptions"],
        summary="Upload prescription order (use this endpoint from frontend)",
        description="Alias for POST /api/prescriptions/. User uploads one or more prescription images, selects shipping address, duration, and notes. No products are required here; pharmacy admin will add products later when approving.",
    )
)
class PrescriptionOrderViewSet(viewsets.GenericViewSet):
    """Standalone endpoint for prescription ordering: POST /api/prescription-orders/."""

    serializer_class = PrescriptionUploadSerializer
    permission_classes = [IsAuthenticated, IsRegisteredUserOnly]
    http_method_names = ["post", "head", "options"]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if "multipart" in (request.content_type or ""):
            for key in ("issue_date", "patient_name_on_rx", "doctor_name", "doctor_reg_number", "save_prescription", "medicine_supply_duration", "prescription_note", "additional_products_note", "shipping_address"):
                val = data.get(key)
                if key == "shipping_address" and isinstance(val, str) and val.strip().isdigit():
                    data[key] = int(val)
                elif key == "save_prescription" and isinstance(val, str):
                    data[key] = val.lower() in ("true", "1", "yes")
        serializer = PrescriptionUploadSerializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        payload = {k: v for k, v in serializer.validated_data.items() if k not in ("file", "images") or (k == "file" and v is not None)}
        if not payload.get("file") and request.FILES.get("file"):
            payload["file"] = request.FILES["file"]
        prescription = Prescription.objects.create(user=request.user, status=Prescription.Status.PENDING, **payload)
        for i, f in enumerate(request.FILES.getlist("images", [])):
            PrescriptionImage.objects.create(prescription=prescription, image=f, order_display=i)
        PrescriptionStatusHistory.objects.create(prescription=prescription, status=Prescription.Status.PENDING)
        return Response(
            PrescriptionSerializer(prescription, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


# ---- Consultation: Doctor/Super manage; User request ----
class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.select_related("user", "doctor").all()
    serializer_class = ConsultationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["status"]
    search_fields = ["subject", "message"]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        qs = super().get_queryset()
        role = getattr(self.request.user, "role", None)
        if role in (UserRole.SUPER_ADMIN, UserRole.DOCTOR):
            return qs
        return qs.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == "create":
            return ConsultationRequestSerializer
        if self.action in ("respond", "partial_update"):
            return ConsultationResponseSerializer
        return ConsultationSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated(), IsRegisteredUser()]
        if self.action in ("partial_update", "update"):
            return [IsAuthenticated(), IsDoctorOrSuper()]
        return [IsAuthenticated(), IsRegisteredUser()]

    def create(self, request, *args, **kwargs):
        serializer = ConsultationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        consultation = Consultation.objects.create(user=request.user, **serializer.validated_data)
        return Response(ConsultationSerializer(consultation).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        """Doctor responds to consultation (Doctor Consultations manage). PATCH response, status."""
        consultation = self.get_object()
        serializer = ConsultationResponseSerializer(consultation, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        consultation.response = serializer.validated_data.get("response", consultation.response)
        consultation.status = serializer.validated_data.get("status", consultation.status)
        if getattr(request.user, "role", None) == UserRole.DOCTOR:
            consultation.doctor = request.user
        consultation.save(update_fields=["response", "status", "doctor", "updated_at"])
        return Response(ConsultationSerializer(consultation).data)

    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated, IsDoctorOrSuper], url_path="respond")
    def respond(self, request, pk=None):
        """Alias for PATCH consultation (doctor response)."""
        return self.partial_update(request)


@extend_schema_view(
    list=extend_schema(tags=["Notifications"], summary="List my notifications"),
    retrieve=extend_schema(tags=["Notifications"], summary="Get notification by id"),
    mark_read=extend_schema(tags=["Notifications"], summary="Mark one notification as read"),
    mark_all_read=extend_schema(tags=["Notifications"], summary="Mark all my notifications as read"),
    subscriptions=extend_schema(tags=["Notifications"], summary="List/create/delete my browser push subscriptions"),
    campaigns=extend_schema(tags=["Notifications"], summary="List/create notification campaigns (admin)"),
    campaign_detail=extend_schema(tags=["Notifications"], summary="Notification campaign details with delivery logs (admin)"),
    health=extend_schema(tags=["Notifications"], summary="Notification system health snapshot (admin)"),
    test_send=extend_schema(tags=["Notifications"], summary="Send test notification to current admin user"),
    broadcast=extend_schema(
        tags=["Notifications"],
        summary="Broadcast notification to all users (admin)",
        request=AdminBroadcastNotificationSerializer,
    ),
)
class NotificationViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = UserNotification.objects.select_related("created_by", "user").all()
    serializer_class = UserNotificationSerializer
    filterset_fields = ["is_read"]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_permissions(self):
        if self.action in ("broadcast", "campaigns", "campaign_detail", "health", "test_send"):
            return [IsAuthenticated(), IsPharmacyAdminOrSuper()]
        return [IsAuthenticated(), IsRegisteredUser()]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    @action(detail=True, methods=["patch"], url_path="read")
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=["is_read", "read_at"])
        return Response(UserNotificationSerializer(notification, context={"request": request}).data)

    @extend_schema(
        request=None,
        responses={200: NotificationMarkedCountSerializer},
    )
    @action(detail=False, methods=["patch"], url_path="read-all")
    def mark_all_read(self, request):
        now = timezone.now()
        updated = UserNotification.objects.filter(user=request.user, is_read=False).update(is_read=True, read_at=now)
        return Response({"marked_count": updated}, status=status.HTTP_200_OK)

    @extend_schema(
        methods=["GET"],
        request=None,
        responses={200: UserNotificationPreferenceSerializer},
    )
    @extend_schema(
        methods=["POST"],
        request=UserNotificationPreferenceUpdateSerializer,
        responses={200: UserNotificationPreferenceSerializer},
    )
    @action(detail=False, methods=["get", "post"], url_path="permission")
    def permission(self, request):
        pref, _ = UserNotificationPreference.objects.get_or_create(user=request.user)
        if request.method.lower() == "get":
            logger.info(
                "Notification permission fetched user_id=%s permission=%s enabled=%s",
                request.user.id,
                pref.browser_permission,
                pref.is_enabled,
            )
            return Response(UserNotificationPreferenceSerializer(pref).data, status=status.HTTP_200_OK)

        incoming_permission = (request.data.get("browser_permission") or "").strip().lower()
        incoming_enabled = request.data.get("is_enabled")
        if incoming_permission in (
            UserNotificationPreference.BrowserPermission.DEFAULT,
            UserNotificationPreference.BrowserPermission.GRANTED,
            UserNotificationPreference.BrowserPermission.DENIED,
        ):
            pref.browser_permission = incoming_permission
        if incoming_enabled is not None:
            pref.is_enabled = bool(incoming_enabled)
        else:
            pref.is_enabled = pref.browser_permission == UserNotificationPreference.BrowserPermission.GRANTED
        pref.last_prompted_at = timezone.now()
        pref.user_agent = (request.META.get("HTTP_USER_AGENT", "") or "")[:500]
        pref.platform = (request.data.get("platform") or "")[:100]
        pref.save()
        logger.info(
            "Notification permission updated user_id=%s permission=%s enabled=%s platform=%s",
            request.user.id,
            pref.browser_permission,
            pref.is_enabled,
            pref.platform,
        )
        return Response(UserNotificationPreferenceSerializer(pref).data, status=status.HTTP_200_OK)

    @extend_schema(
        methods=["GET"],
        request=None,
        responses={200: UserPushSubscriptionSerializer(many=True)},
    )
    @extend_schema(
        methods=["POST"],
        request=UserPushSubscriptionUpsertSerializer,
        responses={200: UserPushSubscriptionSerializer},
    )
    @extend_schema(
        methods=["DELETE"],
        request=UserPushSubscriptionDeleteSerializer,
        responses={200: NotificationRemovedCountSerializer},
    )
    @action(detail=False, methods=["get", "post", "delete"], url_path="subscriptions")
    def subscriptions(self, request):
        method = request.method.lower()
        if method == "get":
            qs = UserPushSubscription.objects.filter(user=request.user).order_by("-updated_at")
            logger.info(
                "Push subscriptions listed user_id=%s count=%s",
                request.user.id,
                qs.count(),
            )
            return Response(
                UserPushSubscriptionSerializer(qs, many=True).data,
                status=status.HTTP_200_OK,
            )

        if method == "post":
            serializer = UserPushSubscriptionUpsertSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            fcm_token = serializer.validated_data["fcm_token"]
            # Upsert by fcm_token (unique at DB level)
            subscription, created = UserPushSubscription.objects.update_or_create(
                fcm_token=fcm_token,
                defaults={
                    "user": request.user,
                    "is_active": serializer.validated_data.get("is_active", True),
                    "user_agent": (request.META.get("HTTP_USER_AGENT", "") or "")[:500],
                    "platform": (serializer.validated_data.get("platform") or "")[:100],
                },
            )
            logger.info(
                "Push subscription upsert user_id=%s created=%s active=%s platform=%s token_prefix=%s",
                request.user.id,
                created,
                subscription.is_active,
                subscription.platform,
                fcm_token[:20],
            )
            return Response(
                UserPushSubscriptionSerializer(subscription).data,
                status=status.HTTP_200_OK,
            )

        fcm_token = (request.data.get("fcm_token") or "").strip()
        if not fcm_token:
            return Response(
                {"fcm_token": "fcm_token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        updated = UserPushSubscription.objects.filter(
            user=request.user,
            fcm_token=fcm_token,
        ).update(is_active=False)
        logger.info(
            "Push subscription deactivated user_id=%s removed_count=%s token_prefix=%s",
            request.user.id,
            updated,
            fcm_token[:20],
        )
        return Response(
            {"removed_count": updated},
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        request=AdminBroadcastNotificationSerializer,
        responses={201: NotificationBroadcastResultSerializer},
    )
    @action(detail=False, methods=["post"], url_path="broadcast")
    def broadcast(self, request):
        serializer = AdminBroadcastNotificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        audience_mode = serializer.validated_data.get(
            "audience_mode",
            NotificationCampaign.AudienceMode.ALL_ACTIVE,
        )
        send_to_opted_in_only = serializer.validated_data.get("send_to_opted_in_only", False)
        logger.info(
            "Notification broadcast requested by_user_id=%s audience_mode=%s opted_in_only=%s title=%s",
            request.user.id,
            audience_mode,
            send_to_opted_in_only,
            serializer.validated_data.get("title", "")[:80],
        )
        campaign, stats = create_and_dispatch_campaign(
            title=serializer.validated_data["title"],
            message=serializer.validated_data["message"],
            target_url=serializer.validated_data.get("target_url", ""),
            requested_by=request.user,
            audience_mode=audience_mode,
            send_to_opted_in_only=send_to_opted_in_only,
            user_ids=serializer.validated_data.get("user_ids", []),
            role_filter=serializer.validated_data.get("role_filter", ""),
            source="admin",
            metadata={"via": "broadcast"},
        )

        return Response(
            {
                "detail": "Notification broadcast sent.",
                "sent_count": stats["sent_count"],
                "title": serializer.validated_data["title"],
                "send_to_opted_in_only": send_to_opted_in_only,
                "target_url": serializer.validated_data.get("target_url", ""),
                "push_attempted": stats["push_attempted"],
                "push_succeeded": stats["push_succeeded"],
                "push_failed": stats["push_failed"],
                "push_deactivated": stats["push_deactivated"],
                "push_async": stats["push_async"],
                "campaign_id": campaign.id,
            },
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        methods=["GET"],
        request=None,
        responses={200: NotificationHealthSerializer},
    )
    @action(detail=False, methods=["get"], url_path="health")
    def health(self, request):
        seven_days_ago = timezone.now() - timedelta(days=7)
        payload = {
            "firebase_initialized": bool(getattr(settings, "FIREBASE_INITIALIZED", False)),
            "firebase_credential_source": (getattr(settings, "FIREBASE_CREDENTIAL_SOURCE", "none") or "none"),
            "firebase_init_error": (getattr(settings, "FIREBASE_INIT_ERROR", "") or "")[:300],
            "celery_task_always_eager": bool(getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False)),
            "redis_enabled": bool(getattr(settings, "USE_REDIS", False)),
            "active_subscriptions": UserPushSubscription.objects.filter(is_active=True).count(),
            "inactive_subscriptions": UserPushSubscription.objects.filter(is_active=False).count(),
            "recently_deactivated_7d": UserPushSubscription.objects.filter(
                is_active=False,
                updated_at__gte=seven_days_ago,
            ).count(),
        }
        return Response(NotificationHealthSerializer(payload).data, status=status.HTTP_200_OK)

    @extend_schema(
        methods=["GET"],
        request=None,
        responses={200: NotificationCampaignSerializer(many=True)},
    )
    @extend_schema(
        methods=["POST"],
        request=NotificationCampaignCreateSerializer,
        responses={201: NotificationBroadcastResultSerializer},
    )
    @action(detail=False, methods=["get", "post"], url_path="campaigns")
    def campaigns(self, request):
        if request.method.lower() == "get":
            queryset = NotificationCampaign.objects.select_related("requested_by").order_by("-created_at")[:100]
            return Response(
                NotificationCampaignSerializer(queryset, many=True).data,
                status=status.HTTP_200_OK,
            )

        serializer = NotificationCampaignCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        campaign, stats = create_and_dispatch_campaign(
            title=serializer.validated_data["title"],
            message=serializer.validated_data["message"],
            target_url=serializer.validated_data.get("target_url", ""),
            requested_by=request.user,
            audience_mode=serializer.validated_data.get(
                "audience_mode",
                NotificationCampaign.AudienceMode.ALL_ACTIVE,
            ),
            send_to_opted_in_only=serializer.validated_data.get("send_to_opted_in_only", False),
            user_ids=serializer.validated_data.get("user_ids", []),
            role_filter=serializer.validated_data.get("role_filter", ""),
            source="admin",
            dedupe_key=serializer.validated_data.get("dedupe_key", ""),
            metadata={"via": "campaigns"},
        )
        return Response(
            {
                "detail": "Notification campaign sent.",
                "sent_count": stats["sent_count"],
                "title": campaign.title,
                "send_to_opted_in_only": serializer.validated_data.get("send_to_opted_in_only", False),
                "target_url": campaign.target_url,
                "push_attempted": stats["push_attempted"],
                "push_succeeded": stats["push_succeeded"],
                "push_failed": stats["push_failed"],
                "push_deactivated": stats["push_deactivated"],
                "push_async": stats["push_async"],
                "campaign_id": campaign.id,
            },
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        request=None,
        responses={200: NotificationCampaignSerializer},
    )
    @action(detail=False, methods=["get"], url_path=r"campaigns/(?P<campaign_id>[^/.]+)")
    def campaign_detail(self, request, campaign_id=None):
        campaign = NotificationCampaign.objects.select_related("requested_by").filter(pk=campaign_id).first()
        if not campaign:
            return Response({"detail": "Campaign not found."}, status=status.HTTP_404_NOT_FOUND)
        failures = NotificationDeliveryLog.objects.filter(
            campaign=campaign,
            status__in=(
                NotificationDeliveryLog.DeliveryStatus.FAILED,
                NotificationDeliveryLog.DeliveryStatus.DEACTIVATED,
            ),
        ).select_related("user")[:30]
        return Response(
            {
                "campaign": NotificationCampaignSerializer(campaign).data,
                "recent_failures": NotificationDeliveryLogSerializer(failures, many=True).data,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        request=NotificationTestSendSerializer,
        responses={201: NotificationBroadcastResultSerializer},
    )
    @action(detail=False, methods=["post"], url_path="test-send")
    def test_send(self, request):
        serializer = NotificationTestSendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        campaign, stats = create_and_dispatch_campaign(
            title=serializer.validated_data["title"],
            message=serializer.validated_data["message"],
            target_url=serializer.validated_data.get("target_url", ""),
            requested_by=request.user,
            audience_mode=NotificationCampaign.AudienceMode.USER_IDS,
            send_to_opted_in_only=False,
            user_ids=[request.user.id],
            source="admin_test",
            metadata={"via": "test-send"},
        )
        return Response(
            {
                "detail": "Test notification sent.",
                "sent_count": stats["sent_count"],
                "title": campaign.title,
                "send_to_opted_in_only": False,
                "target_url": campaign.target_url,
                "push_attempted": stats["push_attempted"],
                "push_succeeded": stats["push_succeeded"],
                "push_failed": stats["push_failed"],
                "push_deactivated": stats["push_deactivated"],
                "push_async": stats["push_async"],
                "campaign_id": campaign.id,
            },
            status=status.HTTP_201_CREATED,
        )


# ---- Page (CMS): Super full; Pharmacy limited (e.g. list + update certain slugs) ----
class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["is_published"]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAnyIncludingGuest()]
        if self.action in ("create", "destroy"):
            return [IsAuthenticated(), IsSuperAdmin()]
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action in ("list", "retrieve") and not (getattr(self.request, "user", None) and self.request.user.is_authenticated):
            return qs.filter(is_published=True)
        return qs


# ---- Blog: categories + posts. Public: active categories + published posts; write: Pharmacy Admin / Super ----
@extend_schema_view(
    list=extend_schema(tags=["Blog"], summary="List blog categories"),
    retrieve=extend_schema(tags=["Blog"], summary="Get blog category by slug"),
    create=extend_schema(tags=["Blog"], summary="Create blog category (admin)"),
    update=extend_schema(tags=["Blog"], summary="Update blog category (admin)"),
    partial_update=extend_schema(tags=["Blog"], summary="Partial update blog category (admin)"),
    destroy=extend_schema(tags=["Blog"], summary="Delete blog category (admin)"),
)
class BlogCategoryViewSet(viewsets.ModelViewSet):
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["is_active"]
    search_fields = ["name", "slug"]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAnyIncludingGuest()]
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = getattr(self.request, "user", None)
        if user and user.is_authenticated:
            role = getattr(user, "role", None)
            if role in (UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN):
                return qs
        return qs.filter(is_active=True)


@extend_schema_view(
    list=extend_schema(tags=["Blog"], summary="List blog posts"),
    retrieve=extend_schema(tags=["Blog"], summary="Get blog post by slug"),
    create=extend_schema(tags=["Blog"], summary="Create blog post (admin)"),
    update=extend_schema(tags=["Blog"], summary="Update blog post (admin)"),
    partial_update=extend_schema(tags=["Blog"], summary="Partial update blog post (admin)"),
    destroy=extend_schema(tags=["Blog"], summary="Delete blog post (admin)"),
)
class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.select_related("category").all()
    serializer_class = BlogPostSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["is_published", "category"]
    search_fields = ["title", "content", "slug"]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAnyIncludingGuest()]
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = getattr(self.request, "user", None)
        if user and user.is_authenticated:
            role = getattr(user, "role", None)
            if role in (UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN):
                return qs
        return qs.filter(is_published=True)


# ---- Settlements (admin-only) ----
@extend_schema_view(
    list=extend_schema(tags=["Settlements"], summary="List order settlements (admin)"),
    retrieve=extend_schema(tags=["Settlements"], summary="Get an order settlement (admin)"),
)
class OrderSettlementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = OrderSettlement.objects.select_related("order").all()
    serializer_class = OrderSettlementSerializer
    permission_classes = [IsAuthenticated, IsPharmacyAdminOrSuper]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["status", "payment_method", "payment_status"]
    search_fields = ["order__id", "cash_deposit_reference", "payout_reference"]

    def _recompute(self, settlement: OrderSettlement):
        # Default commission is 0 unless explicitly set.
        from decimal import Decimal as D

        gross = settlement.order.total or D("0")
        rate = settlement.commission_rate or D("0")
        commission = (gross * rate).quantize(D("0.01"))
        net = (gross - commission).quantize(D("0.01"))
        settlement.gross_amount = gross
        settlement.commission_amount = commission
        settlement.net_payable = net

    @action(detail=True, methods=["post"], url_path="cash-deposit")
    @extend_schema(tags=["Settlements"], summary="Mark COD cash deposited (admin)", request=SettlementCashDepositSerializer)
    def cash_deposit(self, request, pk=None):
        settlement = self.get_object()
        serializer = SettlementCashDepositSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        settlement.cash_collected_amount = serializer.validated_data["cash_collected_amount"]
        settlement.cash_deposit_reference = serializer.validated_data.get("cash_deposit_reference", "") or ""
        settlement.cash_deposited_at = timezone.now()
        settlement.status = OrderSettlement.Status.CASH_DEPOSITED
        settlement.updated_by = request.user
        self._recompute(settlement)
        settlement.save()
        return Response(OrderSettlementSerializer(settlement, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="payout")
    @extend_schema(tags=["Settlements"], summary="Mark payout as settled (admin)", request=SettlementPayoutSerializer)
    def payout(self, request, pk=None):
        settlement = self.get_object()
        serializer = SettlementPayoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        settlement.payout_reference = serializer.validated_data.get("payout_reference", "") or ""
        settlement.settled_at = timezone.now()
        settlement.status = OrderSettlement.Status.SETTLED
        settlement.updated_by = request.user
        self._recompute(settlement)
        settlement.save()
        return Response(OrderSettlementSerializer(settlement, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="refund")
    @extend_schema(tags=["Settlements"], summary="Mark settlement as refunded (admin)")
    def refund(self, request, pk=None):
        settlement = self.get_object()
        settlement.status = OrderSettlement.Status.REFUNDED
        settlement.updated_by = request.user
        settlement.save(update_fields=["status", "updated_by", "updated_at"])
        return Response(OrderSettlementSerializer(settlement, context={"request": request}).data)


# ---- B2B commissions (admin-only) ----
@extend_schema_view(
    list=extend_schema(tags=["B2B"], summary="List B2B commission entries (admin)"),
    retrieve=extend_schema(tags=["B2B"], summary="Get a B2B commission entry (admin)"),
)
class B2BCommissionEntryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = B2BCommissionEntry.objects.select_related("customer", "order").all()
    serializer_class = B2BCommissionEntrySerializer
    permission_classes = [IsAuthenticated, IsPharmacyAdminOrSuper]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["status", "customer"]
    search_fields = ["order__id", "customer__company_name", "customer__user__email", "customer__user__phone"]

    @action(detail=True, methods=["post"], url_path="settle")
    @extend_schema(tags=["B2B"], summary="Mark B2B commission as settled (admin)")
    def settle(self, request, pk=None):
        entry = self.get_object()
        entry.status = B2BCommissionEntry.Status.SETTLED
        entry.settled_at = timezone.now()
        entry.save(update_fields=["status", "settled_at"])
        return Response(B2BCommissionEntrySerializer(entry, context={"request": request}).data)


@extend_schema_view(
    list=extend_schema(tags=["B2B"], summary="List/create B2B customers (admin)"),
    retrieve=extend_schema(tags=["B2B"], summary="Get/update B2B customer profile (admin)"),
)
class B2BCustomerProfileViewSet(viewsets.ModelViewSet):
    queryset = B2BCustomerProfile.objects.select_related("user").all()
    serializer_class = B2BCustomerProfileSerializer
    permission_classes = [IsAuthenticated, IsPharmacyAdminOrSuper]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["is_active"]
    search_fields = ["company_name", "user__email", "user__phone", "user__username"]


# ---- Sidebar category (left sidebar: image + title). List/retrieve: anyone; write: Pharmacy Admin / Super ----
@extend_schema_view(
    list=extend_schema(tags=["Sidebar"], summary="List sidebar categories"),
    retrieve=extend_schema(tags=["Sidebar"], summary="Get a sidebar category"),
    create=extend_schema(tags=["Sidebar"], summary="Create sidebar category (admin)"),
    update=extend_schema(tags=["Sidebar"], summary="Update sidebar category (admin)"),
    partial_update=extend_schema(tags=["Sidebar"], summary="Partial update sidebar category (admin)"),
    destroy=extend_schema(tags=["Sidebar"], summary="Delete sidebar category (admin)"),
)
class SidebarCategoryViewSet(viewsets.ModelViewSet):
    queryset = SidebarCategory.objects.all()
    serializer_class = SidebarCategorySerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAnyIncludingGuest()]
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]


# ---- App logo (slug + image). List/retrieve: anyone; write: Pharmacy Admin / Super ----
@extend_schema_view(
    list=extend_schema(tags=["AppLogos"], summary="List app logos"),
    retrieve=extend_schema(tags=["AppLogos"], summary="Get an app logo"),
    create=extend_schema(tags=["AppLogos"], summary="Create app logo (admin)"),
    update=extend_schema(tags=["AppLogos"], summary="Update app logo (admin)"),
    partial_update=extend_schema(tags=["AppLogos"], summary="Partial update app logo (admin)"),
    destroy=extend_schema(tags=["AppLogos"], summary="Delete app logo (admin)"),
)
class AppLogoViewSet(viewsets.ModelViewSet):
    queryset = AppLogo.objects.all()
    serializer_class = AppLogoSerializer
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAnyIncludingGuest()]
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]


# ---- Ad (banner: image + link). List/retrieve: anyone; write: Pharmacy Admin / Super ----
@extend_schema_view(
    list=extend_schema(tags=["Ads"], summary="List ads"),
    retrieve=extend_schema(tags=["Ads"], summary="Get an ad"),
    create=extend_schema(tags=["Ads"], summary="Create ad (admin)"),
    update=extend_schema(tags=["Ads"], summary="Update ad (admin)"),
    partial_update=extend_schema(tags=["Ads"], summary="Partial update ad (admin)"),
    destroy=extend_schema(tags=["Ads"], summary="Delete ad (admin)"),
)
class AdViewSet(viewsets.ModelViewSet):
    queryset = Ad.objects.all()
    serializer_class = AdSerializer
    filterset_fields = ["is_active"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAnyIncludingGuest()]
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action in ("list", "retrieve") and not (getattr(self.request, "user", None) and self.request.user.is_authenticated):
            return qs.filter(is_active=True)
        return qs


# ---- Combo (combo packages). List/retrieve: anyone; write: Pharmacy Admin / Super ----
@extend_schema_view(
    list=extend_schema(tags=["Combos"], summary="List combos"),
    retrieve=extend_schema(tags=["Combos"], summary="Get a combo"),
    create=extend_schema(tags=["Combos"], summary="Create combo (admin)"),
    update=extend_schema(tags=["Combos"], summary="Update combo (admin)"),
    partial_update=extend_schema(tags=["Combos"], summary="Partial update combo (admin)"),
    destroy=extend_schema(tags=["Combos"], summary="Delete combo (admin)"),
)
class ComboViewSet(viewsets.ModelViewSet):
    queryset = Combo.objects.all()
    serializer_class = ComboSerializer
    filterset_fields = ["is_active"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAnyIncludingGuest()]
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action in ("list", "retrieve") and not (getattr(self.request, "user", None) and self.request.user.is_authenticated):
            return qs.filter(is_active=True)
        return qs


# ---- Product reviews (rating + comment + images). List/retrieve: anyone; create: authenticated (must have purchased); update/delete: owner ----
@extend_schema_view(
    list=extend_schema(tags=["Reviews"], summary="List product reviews"),
    retrieve=extend_schema(tags=["Reviews"], summary="Get a product review"),
    create=extend_schema(tags=["Reviews"], summary="Create product review"),
    update=extend_schema(tags=["Reviews"], summary="Update product review"),
    partial_update=extend_schema(tags=["Reviews"], summary="Partial update product review"),
    destroy=extend_schema(tags=["Reviews"], summary="Delete product review"),
)
class ProductReviewViewSet(viewsets.ModelViewSet):
    queryset = ProductReview.objects.prefetch_related("images").select_related("user", "product").all()
    serializer_class = ProductReviewSerializer
    filterset_fields = ["product", "rating"]

    def get_serializer_class(self):
        if self.action == "create":
            return ProductReviewCreateSerializer
        return ProductReviewSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAnyIncludingGuest()]
        if self.action == "create":
            return [IsAuthenticated(), IsRegisteredUserOnly()]
        return [IsAuthenticated(), IsOwnerOrReadOnly()]

    def get_queryset(self):
        qs = super().get_queryset()
        product_id = self.request.query_params.get("product")
        product_slug = self.request.query_params.get("product_slug")
        if product_id:
            qs = qs.filter(product_id=product_id)
        if product_slug:
            qs = qs.filter(product__slug=product_slug)
        if self.action in ("update", "partial_update", "destroy") and self.request.user.is_authenticated:
            if getattr(self.request.user, "role", None) not in (UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN):
                qs = qs.filter(user=self.request.user)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save(user=request.user)
        for i, f in enumerate(request.FILES.getlist("images", [])):
            ProductReviewImage.objects.create(review=review, image=f, order=i)
        update_product_review_aggregates(review.product)
        return Response(
            ProductReviewSerializer(review, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    def perform_update(self, serializer):
        serializer.save()
        update_product_review_aggregates(serializer.instance.product)

    def perform_destroy(self, instance):
        product = instance.product
        instance.delete()
        update_product_review_aggregates(product)


class SSLCommerzSuccessView(APIView):
    authentication_classes = []
    permission_classes = [AllowAnyIncludingGuest]

    def get(self, request, *args, **kwargs):
        return self._handle(request)

    def post(self, request, *args, **kwargs):
        return self._handle(request)

    def _handle(self, request):
        payload = _extract_payload(request)
        tran_id = (payload.get("tran_id") or "").strip()
        payment_txn = PaymentTransaction.objects.select_related("order", "user").filter(tran_id=tran_id).first()
        if not payment_txn:
            frontend_url = _build_frontend_redirect("failed")
            if frontend_url:
                return HttpResponseRedirect(frontend_url)
            return Response({"detail": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            sslcz = _get_sslcommerz_client()
            verification = {}
            if payload.get("val_id"):
                verification = sslcz.validationTransactionOrder(payload.get("val_id"))
            status_value = _extract_validation_status(verification)
            if status_value in ("VALID", "VALIDATED"):
                if not _verify_payment_amount_matches(payment_txn, verification):
                    _mark_payment_result(payment_txn, PaymentTransaction.Status.FAILED, payload, verification_response=verification)
                    frontend_url = _build_frontend_redirect("failed", order_id=payment_txn.order_id)
                    if frontend_url:
                        return HttpResponseRedirect(frontend_url)
                    return Response({"detail": "Payment amount mismatch."}, status=status.HTTP_400_BAD_REQUEST)
                order = _create_order_from_payment_transaction(payment_txn)
                _mark_payment_result(payment_txn, PaymentTransaction.Status.SUCCESS, payload, verification_response=verification)
                frontend_url = _build_frontend_redirect("success", order_id=order.id)
            else:
                _mark_payment_result(payment_txn, PaymentTransaction.Status.FAILED, payload, verification_response=verification)
                frontend_url = _build_frontend_redirect("failed", order_id=payment_txn.order_id)
        except Exception:
            _mark_payment_result(payment_txn, PaymentTransaction.Status.FAILED, payload)
            frontend_url = _build_frontend_redirect("failed", order_id=payment_txn.order_id)

        if frontend_url:
            return HttpResponseRedirect(frontend_url)
        return Response({"detail": "Payment callback processed."}, status=status.HTTP_200_OK)


class SSLCommerzFailView(APIView):
    authentication_classes = []
    permission_classes = [AllowAnyIncludingGuest]

    def get(self, request, *args, **kwargs):
        return self._handle(request)

    def post(self, request, *args, **kwargs):
        return self._handle(request)

    def _handle(self, request):
        payload = _extract_payload(request)
        tran_id = (payload.get("tran_id") or "").strip()
        payment_txn = PaymentTransaction.objects.select_related("order").filter(tran_id=tran_id).first()
        if payment_txn:
            _mark_payment_result(payment_txn, PaymentTransaction.Status.FAILED, payload)
        frontend_url = _build_frontend_redirect("failed", order_id=getattr(payment_txn, "order_id", None))
        if frontend_url:
            return HttpResponseRedirect(frontend_url)
        return Response({"detail": "Payment marked as failed."}, status=status.HTTP_200_OK)


class SSLCommerzCancelView(APIView):
    authentication_classes = []
    permission_classes = [AllowAnyIncludingGuest]

    def get(self, request, *args, **kwargs):
        return self._handle(request)

    def post(self, request, *args, **kwargs):
        return self._handle(request)

    def _handle(self, request):
        payload = _extract_payload(request)
        tran_id = (payload.get("tran_id") or "").strip()
        payment_txn = PaymentTransaction.objects.select_related("order").filter(tran_id=tran_id).first()
        if payment_txn:
            _mark_payment_result(payment_txn, PaymentTransaction.Status.CANCELLED, payload)
        frontend_url = _build_frontend_redirect("cancelled", order_id=getattr(payment_txn, "order_id", None))
        if frontend_url:
            return HttpResponseRedirect(frontend_url)
        return Response({"detail": "Payment marked as cancelled."}, status=status.HTTP_200_OK)


class SSLCommerzIpnView(APIView):
    authentication_classes = []
    permission_classes = [AllowAnyIncludingGuest]

    def post(self, request, *args, **kwargs):
        payload = _extract_payload(request)
        tran_id = (payload.get("tran_id") or "").strip()
        payment_txn = PaymentTransaction.objects.select_related("order", "user").filter(tran_id=tran_id).first()
        if not payment_txn:
            return Response({"detail": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            sslcz = _get_sslcommerz_client()
            if not sslcz.hash_validate_ipn(payload):
                _mark_payment_result(payment_txn, PaymentTransaction.Status.FAILED, payload)
                return Response({"detail": "IPN hash validation failed."}, status=status.HTTP_400_BAD_REQUEST)
            verification = {}
            if payload.get("val_id"):
                verification = sslcz.validationTransactionOrder(payload.get("val_id"))
            status_value = _extract_validation_status(verification)
            if status_value in ("VALID", "VALIDATED"):
                if not _verify_payment_amount_matches(payment_txn, verification):
                    _mark_payment_result(payment_txn, PaymentTransaction.Status.FAILED, payload, verification_response=verification)
                    return Response({"detail": "Payment amount mismatch."}, status=status.HTTP_400_BAD_REQUEST)
                _create_order_from_payment_transaction(payment_txn)
                _mark_payment_result(payment_txn, PaymentTransaction.Status.IPN_VERIFIED, payload, verification_response=verification)
            else:
                _mark_payment_result(payment_txn, PaymentTransaction.Status.FAILED, payload, verification_response=verification)
                return Response({"detail": "Payment validation failed."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({"detail": f"IPN processing error: {exc}"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "IPN verified."}, status=status.HTTP_200_OK)


@extend_schema_view(
    list=extend_schema(tags=["Wishlist"], summary="List wishlist items for the current user"),
    create=extend_schema(tags=["Wishlist"], summary="Add a product to the user's wishlist"),
    destroy=extend_schema(tags=["Wishlist"], summary="Remove a wishlist item by ID"),
)
class WishlistViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsRegisteredUser]
    queryset = WishlistItem.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return WishlistItemCreateSerializer
        return WishlistItemSerializer

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user).select_related(
            "product", "product__unit"
        )

    def create(self, request, *args, **kwargs):
        serializer = WishlistItemCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        wishlist_item = serializer.save(user=request.user)
        response_serializer = WishlistItemSerializer(wishlist_item, context={"request": request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="remove", permission_classes=[IsAuthenticated, IsRegisteredUser])
    @extend_schema(
        tags=["Wishlist"],
        summary="Remove a product from the wishlist",
        request=WishlistItemCreateSerializer,
        responses={204: None},
    )
    def remove_product(self, request):
        """
        Remove a product from the current user's wishlist using the product ID in the request body.
        Body format: {"product": <product_id>}
        """
        product_id = request.data.get("product")
        if not product_id:
            return Response({"product": "product is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        wishlist_item = WishlistItem.objects.filter(user=request.user, product_id=product_id).first()
        if not wishlist_item:
            return Response({"detail": "Product is not in your wishlist."}, status=status.HTTP_400_BAD_REQUEST)
            
        wishlist_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

