import django
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_pharma.settings")
django.setup()

from core.models import DeliveryMethod

print("All delivery methods:")
for dm in DeliveryMethod.objects.all():
    print(f"ID: {dm.id}, Name: {dm.name}, Type: {dm.delivery_type}, Active: {dm.is_active}, Amount: {dm.amount}, Price: {dm.price}")
