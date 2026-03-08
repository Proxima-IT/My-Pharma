"""
Core API views with RBAC.
"""
from decimal import Decimal
from django.db.models.deletion import ProtectedError
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema_view, extend_schema

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

from .models import Brand, Category, Ingredient, Product, ProductImage, Order, OrderItem, Prescription, PrescriptionItem, Consultation, Page, Cart, CartItem, Coupon, SidebarCategory, Ad
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    CategoryTreeSerializer,
    IngredientSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductWriteSerializer,
    ProductImageSerializer,
    ProductImageCreateSerializer,
    InventoryProductSerializer,
    OrderSerializer,
    OrderWriteSerializer,
    OrderStatusSerializer,
    CartSerializer,
    CartItemSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer,
    PlaceOrderFromCartSerializer,
    PrescriptionSerializer,
    PrescriptionUploadSerializer,
    PrescriptionVerifySerializer,
    ConsultationSerializer,
    ConsultationRequestSerializer,
    ConsultationResponseSerializer,
    PageSerializer,
    SidebarCategorySerializer,
    AdSerializer,
)
from .services import (
    get_or_create_cart,
    get_cart_summary,
    validate_coupon,
    get_delivery_zone_for_district,
    validate_min_order,
)
from .filters import ProductFilter


# ---- Category (hierarchy: parent / children). List/tree: anyone; CRUD: Pharmacy Admin / Super ----
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.select_related("parent").prefetch_related("children").all()
    serializer_class = CategorySerializer
    filterset_fields = ["is_active", "parent"]
    search_fields = ["name", "slug"]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_permissions(self):
        if self.action in ("list", "retrieve", "tree"):
            return [AllowAnyIncludingGuest()]
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]

    def get_serializer_class(self):
        if self.action == "tree":
            return CategoryTreeSerializer
        return CategorySerializer

    @action(detail=False, methods=["get"], url_path="tree")
    def tree(self, request):
        """Return category hierarchy (root categories with nested children). ?parent__isnull=true for roots."""
        roots = Category.objects.filter(parent__isnull=True, is_active=True).prefetch_related("children").order_by("name")
        return Response(CategoryTreeSerializer(roots, many=True, context={"request": request}).data)


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


# ---- Product (catalog search & filter per PRODUCT_CATALOG.md). Inventory = quantity_in_stock ----
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category", "brand", "ingredient").prefetch_related("images").all()
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
        if self.action in ("list", "retrieve"):
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


# ---- Order: Pharmacy/Super see all; User sees own. Purchase = create (RegisteredUserOnly) ----
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["status"]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        qs = Order.objects.select_related("user", "prescription").prefetch_related("items__product").all()
        role = getattr(self.request.user, "role", None)
        if role in (UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN):
            return qs
        return qs.filter(user=self.request.user)

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated(), IsRegisteredUserOnly()]
        return [IsAuthenticated(), IsRegisteredUser()]

    def get_serializer_class(self):
        if self.action == "create":
            return OrderWriteSerializer
        if self.action in ("partial_update", "update"):
            return OrderStatusSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        role = getattr(request.user, "role", None)
        if role not in (UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN):
            return Response({"detail": "Only pharmacy admin or super admin can update order status."}, status=status.HTTP_403_FORBIDDEN)
        serializer = OrderStatusSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(OrderSerializer(order).data)

    def update(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


# ---- Cart: one cart per user; add, update/remove items, summary, place order ----
class CartViewSet(viewsets.GenericViewSet):
    """GET /api/cart/ – my cart with items and summary. POST add, POST place-order."""
    permission_classes = [IsAuthenticated, IsRegisteredUser]
    serializer_class = CartSerializer

    def list(self, request, *args, **kwargs):
        cart = get_or_create_cart(request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="add")
    def add(self, request):
        """POST /api/cart/add/ – body: { product: id, quantity: int }."""
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]
        cart = get_or_create_cart(request.user)
        from .models import CartItem
        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity, "price_at_order": product.price},
        )
        if not created:
            item.quantity += quantity
            if item.quantity > product.quantity_in_stock:
                return Response(
                    {"quantity": f"Insufficient stock. Available: {product.quantity_in_stock}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.save(update_fields=["quantity"])
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

        from authentication.models import UserAddress
        address = UserAddress.objects.filter(user=request.user, pk=address_id).first()
        if not address:
            return Response(
                {"shipping_address_id": "Address not found or not yours."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        shipping_text = f"{address.full_name}, {address.email}, {address.phone}, {address.district}, {address.thana}, {address.address}"

        delivery_zone = get_delivery_zone_for_district(address.district)
        coupon = None
        if coupon_code:
            items = cart.items.select_related("product").all()
            subtotal = sum((i.price_at_order * i.quantity for i in items), Decimal("0"))
            try:
                coupon, _ = validate_coupon(coupon_code, subtotal)
            except ValueError as e:
                return Response({"coupon_code": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        summary = get_cart_summary(cart, delivery_zone=delivery_zone, coupon=coupon)
        if not validate_min_order(summary["subtotal"]):
            return Response(
                {"detail": f"Minimum order amount is ৳100. Subtotal: ৳{summary['subtotal']}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        for item in cart.items.select_related("product").all():
            if item.quantity > item.product.quantity_in_stock:
                return Response(
                    {"detail": f"Insufficient stock for {item.product.name}. Available: {item.product.quantity_in_stock}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        order = Order.objects.create(
            user=request.user,
            status=Order.Status.PENDING,
            total=summary["total_payable"],
            shipping_address=shipping_text,
            notes=notes,
        )
        for item in cart.items.select_related("product").all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price_at_order=item.price_at_order,
            )
            item.product.quantity_in_stock -= item.quantity
            item.product.save(update_fields=["quantity_in_stock"])

        if coupon:
            coupon.times_used += 1
            coupon.save(update_fields=["times_used"])

        cart.items.all().delete()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class CartItemViewSet(viewsets.GenericViewSet):
    """PATCH /api/cart/items/<id>/ – update quantity. DELETE – remove item."""
    permission_classes = [IsAuthenticated, IsRegisteredUser]
    serializer_class = CartItemSerializer

    def get_queryset(self):
        cart = get_or_create_cart(self.request.user)
        return CartItem.objects.filter(cart=cart).select_related("product")

    def partial_update(self, request, pk=None):
        item = self.get_object()
        serializer = UpdateCartItemSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        qty = serializer.validated_data.get("quantity")
        if qty is not None:
            if qty == 0:
                item.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            if qty > item.product.quantity_in_stock:
                return Response(
                    {"quantity": f"Insufficient stock. Available: {item.product.quantity_in_stock}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.quantity = qty
            item.save(update_fields=["quantity"])
        return Response(CartItemSerializer(item, context={"request": request}).data)

    def destroy(self, request, pk=None):
        item = self.get_object()
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---- Prescription: Pharmacy/Super list & verify; User upload (flow: PENDING -> APPROVED/REJECTED; APPROVED -> USED when linked to order) ----
class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.select_related("user", "verified_by").prefetch_related("items__product").all()
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["status"]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        qs = super().get_queryset()
        role = getattr(self.request.user, "role", None)
        if role in (UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN):
            return qs
        return qs.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == "create":
            return PrescriptionUploadSerializer
        if self.action in ("verify", "partial_update"):
            return PrescriptionVerifySerializer
        return PrescriptionSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated(), IsRegisteredUserOnly()]
        if self.action in ("partial_update", "verify"):
            return [IsAuthenticated(), IsPharmacyAdminOrSuper()]
        # list, retrieve: any authenticated user (get_queryset restricts to own for non-Pharmacy/Super)
        return [IsAuthenticated(), IsRegisteredUser()]

    def create(self, request, *args, **kwargs):
        serializer = PrescriptionUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = {k: v for k, v in serializer.validated_data.items()}
        prescription = Prescription.objects.create(user=request.user, status=Prescription.Status.PENDING, **data)
        return Response(PrescriptionSerializer(prescription).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        """Verify or reject prescription. PENDING -> APPROVED (with doctor details + items) or REJECTED."""
        prescription = self.get_object()
        serializer = PrescriptionVerifySerializer(prescription, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        prescription.status = data.get("status", prescription.status)
        prescription.notes = data.get("notes", prescription.notes)
        prescription.doctor_name = data.get("doctor_name", prescription.doctor_name)
        prescription.doctor_reg_number = data.get("doctor_reg_number", prescription.doctor_reg_number)
        prescription.has_signature = data.get("has_signature", prescription.has_signature)
        prescription.patient_name_on_rx = data.get("patient_name_on_rx", prescription.patient_name_on_rx)
        prescription.verified_by = request.user
        prescription.verified_at = timezone.now()
        prescription.save(update_fields=["status", "notes", "doctor_name", "doctor_reg_number", "has_signature", "patient_name_on_rx", "verified_by", "verified_at"])
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
        return Response(PrescriptionSerializer(prescription).data)

    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated, IsPharmacyAdminOrSuper], url_path="verify")
    def verify(self, request, pk=None):
        """Alias for PATCH prescription (verify/reject)."""
        return self.partial_update(request)


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
