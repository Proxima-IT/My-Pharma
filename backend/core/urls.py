"""Core API URL configuration (products, orders, prescriptions, consultations, CMS, cart)."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"categories", views.CategoryViewSet, basename="category")
router.register(r"sidebar-categories", views.SidebarCategoryViewSet, basename="sidebar-category")
router.register(r"ads", views.AdViewSet, basename="ad")
router.register(r"combos", views.ComboViewSet, basename="combo")
router.register(r"logos", views.AppLogoViewSet, basename="app-logo")
router.register(r"brands", views.BrandViewSet, basename="brand")
router.register(r"ingredients", views.IngredientViewSet, basename="ingredient")
router.register(r"units", views.UnitViewSet, basename="unit")
router.register(r"products", views.ProductViewSet, basename="product")
router.register(r"reviews", views.ProductReviewViewSet, basename="review")
router.register(r"orders", views.OrderViewSet, basename="order")
router.register(r"delivery-methods", views.DeliveryMethodViewSet, basename="delivery-method")
router.register(r"coupons", views.CouponViewSet, basename="coupon")
router.register(r"prescriptions", views.PrescriptionViewSet, basename="prescription")
router.register(r"prescription-orders", views.PrescriptionOrderViewSet, basename="prescription-order")
router.register(r"consultations", views.ConsultationViewSet, basename="consultation")
router.register(r"notifications", views.NotificationViewSet, basename="notifications")
router.register(r"pages", views.PageViewSet, basename="page")
router.register(r"blog-categories", views.BlogCategoryViewSet, basename="blog-category")
router.register(r"blog-posts", views.BlogPostViewSet, basename="blog-post")
router.register(r"cart", views.CartViewSet, basename="cart")
router.register(r"settlements", views.OrderSettlementViewSet, basename="settlement")
router.register(r"b2b/customers", views.B2BCustomerProfileViewSet, basename="b2b-customer")
router.register(r"b2b/commissions", views.B2BCommissionEntryViewSet, basename="b2b-commission")
router.register(r"wishlist", views.WishlistViewSet, basename="wishlist")

urlpatterns = [
    path("payments/sslcommerz/success/", views.SSLCommerzSuccessView.as_view(), name="sslcommerz-success"),
    path("payments/sslcommerz/fail/", views.SSLCommerzFailView.as_view(), name="sslcommerz-fail"),
    path("payments/sslcommerz/cancel/", views.SSLCommerzCancelView.as_view(), name="sslcommerz-cancel"),
    path("payments/sslcommerz/ipn/", views.SSLCommerzIpnView.as_view(), name="sslcommerz-ipn"),
    path(
        "cart/items/<int:pk>/",
        views.CartItemViewSet.as_view({"patch": "partial_update", "delete": "destroy"}),
        name="cart-item-detail",
    ),
    path("", include(router.urls)),
]
