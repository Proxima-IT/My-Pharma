with open('core/serializers.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"delivery_type",\n            "duration",', '"delivery_type",\n            "amount",\n            "duration",')
content = content.replace('def validate_extra_charge(self, value):', 'def validate_price(self, value):')
content = content.replace('extra_charge cannot be negative', 'price cannot be negative')

with open('core/serializers.py', 'w', encoding='utf-8') as f:
    f.write(content)
