import django
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_pharma.settings")
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS = ['*']

from rest_framework.test import APIRequestFactory
from core.views import DeliveryMethodViewSet, OrderViewSet
from authentication.models import User
from core.models import Product

# Get a user (e.g. superuser or default customer)
user = User.objects.filter(is_superuser=True).first() or User.objects.first()
print("Using user:", user.username if user else "None")

factory = APIRequestFactory()

# 1. Test Delivery Methods
print("\n--- Testing GET /api/delivery-methods/ ---")
try:
    request = factory.get('/api/delivery-methods/')
    if user:
        from rest_framework.test import force_authenticate
        force_authenticate(request, user=user)
    view = DeliveryMethodViewSet.as_view({'get': 'list'})
    response = view(request)
    print("Status:", response.status_code)
    print("Data:", response.data)
except Exception as e:
    import traceback
    traceback.print_exc()

# 2. Test Buy Now Preview
product = Product.objects.filter(is_active=True).first()
if product:
    print(f"\n--- Testing POST /api/orders/buy-now-preview/ for Product {product.id} ---")
    payload = {
        "product": product.id,
        "quantity": 1,
    }
    try:
        request = factory.post('/api/orders/buy-now-preview/', payload, format='json')
        if user:
            from rest_framework.test import force_authenticate
            force_authenticate(request, user=user)
        view = OrderViewSet.as_view({'post': 'buy_now_preview'})
        response = view(request)
        print("Status:", response.status_code)
        print("Data:", response.data)
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("No active product found for preview test.")
