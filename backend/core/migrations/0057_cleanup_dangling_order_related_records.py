from django.db import migrations

def cleanup_dangling_records(apps, schema_editor):
    Order = apps.get_model("core", "Order")
    OrderItem = apps.get_model("core", "OrderItem")
    OrderStatusHistory = apps.get_model("core", "OrderStatusHistory")
    OrderImage = apps.get_model("core", "OrderImage")
    OrderSettlement = apps.get_model("core", "OrderSettlement")

    order_ids = set(Order.objects.values_list("id", flat=True))

    deleted_items = OrderItem.objects.exclude(order_id__in=order_ids).delete()
    deleted_history = OrderStatusHistory.objects.exclude(order_id__in=order_ids).delete()
    deleted_images = OrderImage.objects.exclude(order_id__in=order_ids).delete()
    deleted_settlements = OrderSettlement.objects.exclude(order_id__in=order_ids).delete()

    print(f"Cleaned up dangling database records: items={deleted_items[0]}, status_histories={deleted_history[0]}, images={deleted_images[0]}, settlements={deleted_settlements[0]}")

class Migration(migrations.Migration):

    dependencies = [
        ("core", "0056_combo_custom_price_combo_discount_price"),
    ]

    operations = [
        migrations.RunPython(cleanup_dangling_records, migrations.RunPython.noop),
    ]
