import django
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_pharma.settings")
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS = ['*']

from core.models import Product
from core.serializers import ProductListSerializer

products = Product.objects.all()
print(f"Checking {products.count()} products total in DB...")

failed = 0
for p in products:
    try:
        # Try to serialize
        serializer = ProductListSerializer(p, context={'request': None})
        data = serializer.data
    except Exception as e:
        failed += 1
        print(f"--- Product ID {p.id} ({p.name}) failed to serialize! ---")
        import traceback
        traceback.print_exc()

print(f"Validation complete. Failed: {failed}/{products.count()}")
