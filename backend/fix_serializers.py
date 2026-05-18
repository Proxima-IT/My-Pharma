with open('core/serializers.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('duration = serializers.PrimaryKeyRelatedField(', 'delivery_method = serializers.PrimaryKeyRelatedField(')
content = content.replace('validated_data.pop("duration", None)', 'validated_data.pop("delivery_method", None)')

with open('core/serializers.py', 'w', encoding='utf-8') as f:
    f.write(content)
