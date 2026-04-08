from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0027_blogpost_article_image_short_description"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="OrderSettlement",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("payment_method", models.CharField(choices=[("COD", "Cash on Delivery"), ("ONLINE", "Online")], db_index=True, default="COD", max_length=10)),
                ("payment_status", models.CharField(choices=[("PENDING", "Pending"), ("PAID", "Paid")], db_index=True, default="PENDING", max_length=10)),
                ("commission_rate", models.DecimalField(decimal_places=4, default=0, help_text="Commission rate as fraction (e.g. 0.0500 = 5%).", max_digits=6)),
                ("commission_amount", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("gross_amount", models.DecimalField(decimal_places=2, default=0, help_text="Order total amount used for settlement.", max_digits=12)),
                ("net_payable", models.DecimalField(decimal_places=2, default=0, help_text="gross_amount - commission_amount", max_digits=12)),
                ("status", models.CharField(choices=[("PENDING", "Pending Settlement"), ("CASH_DEPOSITED", "Cash Deposited"), ("SETTLED", "Settled"), ("REFUNDED", "Refunded"), ("CANCELLED", "Cancelled")], db_index=True, default="PENDING", max_length=20)),
                ("cash_collected_amount", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("cash_deposit_reference", models.CharField(blank=True, max_length=255)),
                ("cash_deposited_at", models.DateTimeField(blank=True, null=True)),
                ("payout_reference", models.CharField(blank=True, max_length=255)),
                ("settled_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("created_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="created_settlements", to=settings.AUTH_USER_MODEL)),
                ("updated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_settlements", to=settings.AUTH_USER_MODEL)),
                ("order", models.OneToOneField(db_index=True, on_delete=django.db.models.deletion.CASCADE, related_name="settlement", to="core.order")),
            ],
            options={
                "db_table": "core_order_settlement",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="ordersettlement",
            index=models.Index(fields=["status", "created_at"], name="core_order__status__c_2b3b87_idx"),
        ),
        migrations.AddIndex(
            model_name="ordersettlement",
            index=models.Index(fields=["payment_method", "payment_status"], name="core_order__paymen_f73bb7_idx"),
        ),
        migrations.CreateModel(
            name="B2BCustomerProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("company_name", models.CharField(blank=True, max_length=255)),
                ("commission_rate", models.DecimalField(decimal_places=4, default=0, help_text="Commission rate as fraction (e.g. 0.0200 = 2%).", max_digits=6)),
                ("is_active", models.BooleanField(db_index=True, default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.OneToOneField(db_index=True, on_delete=django.db.models.deletion.CASCADE, related_name="b2b_profile", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "db_table": "core_b2b_customer_profile",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="B2BCommissionEntry",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("commission_rate", models.DecimalField(decimal_places=4, default=0, max_digits=6)),
                ("commission_amount", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("status", models.CharField(choices=[("PENDING", "Pending"), ("SETTLED", "Settled")], db_index=True, default="PENDING", max_length=10)),
                ("note", models.CharField(blank=True, max_length=255)),
                ("settled_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("customer", models.ForeignKey(db_index=True, on_delete=django.db.models.deletion.CASCADE, related_name="commissions", to="core.b2bcustomerprofile")),
                ("order", models.ForeignKey(db_index=True, on_delete=django.db.models.deletion.CASCADE, related_name="b2b_commissions", to="core.order")),
            ],
            options={
                "db_table": "core_b2b_commission_entry",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="b2bcommissionentry",
            index=models.Index(fields=["customer", "status", "created_at"], name="core_b2b__custome_6d5caa_idx"),
        ),
        migrations.AddIndex(
            model_name="b2bcommissionentry",
            index=models.Index(fields=["order"], name="core_b2b__order_i_6e2d29_idx"),
        ),
        migrations.AddConstraint(
            model_name="b2bcommissionentry",
            constraint=models.UniqueConstraint(fields=("customer", "order"), name="unique_b2b_commission_per_order"),
        ),
    ]

