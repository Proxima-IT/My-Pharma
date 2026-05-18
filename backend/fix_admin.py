import re

with open('core/admin.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'class DeliveryMethodAdmin\(admin\.ModelAdmin\):[\s\S]*?ordering = \(\"order\", \"id\"\)',
    'class DeliveryMethodAdmin(admin.ModelAdmin):\n    list_display = ("name", "delivery_type", "amount", "duration", "price", "is_active", "order")\n    list_editable = ("amount", "duration", "price", "is_active", "order")\n    ordering = ("order", "id")',
    content
)

with open('core/admin.py', 'w', encoding='utf-8') as f:
    f.write(content)
