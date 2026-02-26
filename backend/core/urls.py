"""Core API URL configuration (products, orders, prescriptions, consultations, CMS, cart)."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"categories", views.CategoryViewSet, basename="category")
router.register(r"brands", views.BrandViewSet, basename="brand")
router.register(r"ingredients", views.IngredientViewSet, basename="ingredient")
router.register(r"products", views.ProductViewSet, basename="product")
router.register(r"orders", views.OrderViewSet, basename="order")
router.register(r"prescriptions", views.PrescriptionViewSet, basename="prescription")
router.register(r"consultations", views.ConsultationViewSet, basename="consultation")
router.register(r"pages", views.PageViewSet, basename="page")
router.register(r"cart", views.CartViewSet, basename="cart")

urlpatterns = [
    path(
        "cart/items/<int:pk>/",
        views.CartItemViewSet.as_view({"patch": "partial_update", "delete": "destroy"}),
        name="cart-item-detail",
    ),
    path("", include(router.urls)),
]
