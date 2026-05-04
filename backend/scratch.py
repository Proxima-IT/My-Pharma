import django
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_pharma.settings")
django.setup()

from core.serializers import ComboSerializer

data = {
    "title": "Test",
    "price": "100.00",
    "original_price": "",
    "order": "0",
    "is_active": "true"
}
serializer = ComboSerializer(data=data)
print("Is valid:", serializer.is_valid())
if not serializer.is_valid():
    print("Errors:", serializer.errors)
else:
    serializer.save()
    print("Saved successfully!")
