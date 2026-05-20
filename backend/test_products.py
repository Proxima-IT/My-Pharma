import django
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_pharma.settings")
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS = ['*']

from rest_framework.test import APIRequestFactory
from core.views import ProductViewSet

factory = APIRequestFactory()
# Request with page_size=1000 to replicate the frontend call
request = factory.get('/api/products/?page_size=1000&is_active=true')
view = ProductViewSet.as_view({'get': 'list'})

try:
    response = view(request)
    print("Response status:", response.status_code)
    if response.status_code == 200:
        results = response.data.get('results', [])
        print("Total products serialized successfully:", len(results))
        # Let's inspect the results or print first few items
        if results:
            print("First product sample:", results[0])
    else:
        print("Response data on error:", response.data)
except Exception as e:
    import traceback
    traceback.print_exc()
