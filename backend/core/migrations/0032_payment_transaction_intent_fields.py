from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0031_payment_transaction_sslcommerz"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="paymenttransaction",
            name="cart_snapshot",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="paymenttransaction",
            name="coupon_id_ref",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="paymenttransaction",
            name="delivery_fee",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="paymenttransaction",
            name="discount_amount",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="paymenttransaction",
            name="notes",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="paymenttransaction",
            name="shipping_address",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="paymenttransaction",
            name="subtotal_before_discount",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="paymenttransaction",
            name="user",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="payment_transactions", to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name="paymenttransaction",
            name="order",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="payment_transactions", to="core.order"),
        ),
    ]
