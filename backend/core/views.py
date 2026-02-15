"""
Core API views with RBAC.
- Products, Prescriptions (verify), Inventory, Orders (all): IsPharmacyAdminOrSuper
- Prescriptions (list/retrieve): IsRegisteredUser; users see only own, Pharmacy/Super see all
- Orders (own): IsRegisteredUser + IsOwnerOrReadOnly
- Consultations (manage): IsDoctorOrSuper; (request): IsRegisteredUser
- CMS: IsSuperAdmin (full) or IsPharmacyAdminOrSuper (limited)
- Purchase (place order), Upload Prescription: IsRegisteredUserOnly
"""
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

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

from .models import Brand, Category, Ingredient, Product, Order, OrderItem, Prescription, PrescriptionItem, Consultation, Page
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    CategoryTreeSerializer,
    IngredientSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductWriteSerializer,
    OrderSerializer,
    OrderWriteSerializer,
    OrderStatusSerializer,
    PrescriptionSerializer,
    PrescriptionUploadSerializer,
    PrescriptionVerifySerializer,
    ConsultationSerializer,
    ConsultationRequestSerializer,
    ConsultationResponseSerializer,
    PageSerializer,
)
from .filters import ProductFilter


# ---- Category (hierarchy: parent / children). Pharmacy Admin / Super ----
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.select_related("parent").prefetch_related("children").all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsPharmacyAdminOrSuper]
    filterset_fields = ["is_active", "parent"]
    search_fields = ["name", "slug"]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

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
            return [IsAuthenticated(), AllowAnyIncludingGuest()]
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
            return [IsAuthenticated(), AllowAnyIncludingGuest()]
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]


# ---- Product (catalog search & filter per PRODUCT_CATALOG.md). Inventory = quantity_in_stock ----
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category", "brand", "ingredient").all()
    permission_classes = [IsAuthenticated]
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
            return [IsAuthenticated(), AllowAnyIncludingGuest()]
        return [IsAuthenticated(), IsPharmacyAdminOrSuper()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_authenticated:
            return qs
        return qs.filter(is_active=True)

    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated, IsPharmacyAdminOrSuper])
    def inventory(self, request, slug=None):
        """Update quantity_in_stock (Manage Inventory)."""
        product = self.get_object()
        qty = request.data.get("quantity_in_stock")
        if qty is None:
            return Response({"quantity_in_stock": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product.quantity_in_stock = int(qty)
            product.save(update_fields=["quantity_in_stock", "updated_at"])
        except (TypeError, ValueError):
            return Response({"quantity_in_stock": ["Must be a non-negative integer."]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ProductDetailSerializer(product).data)


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
