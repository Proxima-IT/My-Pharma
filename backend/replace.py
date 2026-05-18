import re

with open('core/serializers.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace class and model names
content = content.replace('DeliveryDurationSerializer', 'DeliveryMethodSerializer')
content = content.replace('DeliveryDuration.objects', 'DeliveryMethod.objects')
content = content.replace('DeliveryDuration', 'DeliveryMethod')

# Update fields in OrderSerializer
content = content.replace('"duration_name"', '"delivery_method_name"')
content = content.replace('"duration_days"', '"delivery_method_duration"')
content = content.replace('"duration"', '"delivery_method"')

content = content.replace('duration.name', 'delivery_method.name')
content = content.replace('duration.days', 'delivery_method.duration')

# Handle parameter names
content = content.replace('delivery_duration_id', 'delivery_method_id')
content = content.replace('delivery_duration', 'delivery_method')

# Fix extra_charge -> price in the serializer itself
content = content.replace('"extra_charge"', '"price"')
content = content.replace('"days"', '"duration"')

with open('core/serializers.py', 'w', encoding='utf-8') as f:
    f.write(content)

with open('core/views.py', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('DeliveryDuration', 'DeliveryMethod')
content = content.replace('DeliveryDurations', 'DeliveryMethods')
content = content.replace('delivery_duration', 'delivery_method')
content = content.replace('delivery-durations', 'delivery-methods')
with open('core/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

with open('core/urls.py', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('DeliveryDuration', 'DeliveryMethod')
content = content.replace('delivery-durations', 'delivery-methods')
content = content.replace('delivery-duration', 'delivery-method')
with open('core/urls.py', 'w', encoding='utf-8') as f:
    f.write(content)

with open('core/services.py', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('DeliveryDuration', 'DeliveryMethod')
content = content.replace('delivery_duration', 'delivery_method')
content = content.replace('extra_charge', 'price')
with open('core/services.py', 'w', encoding='utf-8') as f:
    f.write(content)

with open('openapi-schema.yml', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('DeliveryDuration', 'DeliveryMethod')
content = content.replace('delivery_duration', 'delivery_method')
content = content.replace('DeliveryDurations', 'DeliveryMethods')
content = content.replace('delivery-durations', 'delivery-methods')
with open('openapi-schema.yml', 'w', encoding='utf-8') as f:
    f.write(content)
