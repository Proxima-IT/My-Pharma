"""
URL Configuration for My Pharma Project
Production-ready API routing with Swagger documentation.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Schema view configuration for Swagger
schema_view = get_schema_view(
    openapi.Info(
        title="My Pharma API",
        default_version='v1',
        description="""
        ## My Pharma - Online Pharmacy Platform API
        
        Production-ready authentication and authorization system for healthcare.
        
        ### Features:
        - JWT-based authentication
        - Phone number OTP verification
        - Email/password authentication
        - Role-Based Access Control (RBAC)
        - Guest user access
        - Rate limiting and security
        
        ### User Roles:
        - **SUPER_ADMIN**: Full system access
        - **PHARMACY_ADMIN**: Pharmacy management
        - **DOCTOR**: Prescription management
        - **REGISTERED_USER**: Customer access
        - **GUEST_USER**: Browse-only access
        """,
        terms_of_service="https://mypharma.com/terms/",
        contact=openapi.Contact(email="support@mypharma.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # Authentication API
    path('api/auth/', include('authentication.urls')),
    
]

# Serve media files in development
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
