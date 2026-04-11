from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0030_merge_0027_merge_0025_merge_20260317_1649_0026_user_notification_0029_product_is_generic"),
    ]

    operations = [
        migrations.CreateModel(
            name="PaymentTransaction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("method", models.CharField(choices=[("COD", "Cash on Delivery"), ("BKASH", "bKash"), ("NAGAD", "Nagad"), ("ROCKET", "Rocket"), ("UPAY", "Upay"), ("CARD", "Card"), ("ONLINE", "Online")], db_index=True, default="COD", max_length=20)),
                ("provider", models.CharField(default="SSLCOMMERZ", max_length=30)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("currency", models.CharField(default="BDT", max_length=10)),
                ("tran_id", models.CharField(db_index=True, max_length=64, unique=True)),
                ("val_id", models.CharField(blank=True, db_index=True, max_length=128)),
                ("session_key", models.CharField(blank=True, db_index=True, max_length=128)),
                ("gateway_url", models.URLField(blank=True, max_length=500)),
                ("bank_tran_id", models.CharField(blank=True, db_index=True, max_length=128)),
                ("card_type", models.CharField(blank=True, max_length=120)),
                ("status", models.CharField(choices=[("INITIATED", "Initiated"), ("PENDING", "Pending"), ("SUCCESS", "Success"), ("FAILED", "Failed"), ("CANCELLED", "Cancelled"), ("IPN_VERIFIED", "IPN Verified")], db_index=True, default="INITIATED", max_length=20)),
                ("request_payload", models.JSONField(blank=True, default=dict)),
                ("gateway_response", models.JSONField(blank=True, default=dict)),
                ("verified_response", models.JSONField(blank=True, default=dict)),
                ("verified_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("order", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="payment_transactions", to="core.order")),
            ],
            options={
                "db_table": "core_payment_transaction",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="paymenttransaction",
            index=models.Index(fields=["order", "status"], name="core_paymen_order_i_75306c_idx"),
        ),
        migrations.AddIndex(
            model_name="paymenttransaction",
            index=models.Index(fields=["method", "status"], name="core_paymen_method_16ff84_idx"),
        ),
    ]
