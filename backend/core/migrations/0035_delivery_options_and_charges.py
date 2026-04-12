from django.db import migrations, models


def seed_default_delivery_options(apps, schema_editor):
    DeliveryDuration = apps.get_model("core", "DeliveryDuration")
    defaults = [
        {
            "delivery_type": "STANDARD",
            "name": "Standard Delivery",
            "days": 3,
            "extra_charge": 0,
            "order": 0,
            "is_active": True,
        },
        {
            "delivery_type": "SAME_DAY",
            "name": "Same Day Delivery",
            "days": 1,
            "extra_charge": 80,
            "order": 1,
            "is_active": True,
        },
        {
            "delivery_type": "EXPRESS",
            "name": "Express Delivery",
            "days": 1,
            "extra_charge": 50,
            "order": 2,
            "is_active": True,
        },
    ]
    for row in defaults:
        DeliveryDuration.objects.get_or_create(
            delivery_type=row["delivery_type"],
            defaults=row,
        )


def noop_reverse(apps, schema_editor):
    pass


def add_missing_delivery_columns(apps, schema_editor):
    connection = schema_editor.connection
    with connection.cursor() as cursor:
        cursor.execute("SHOW COLUMNS FROM core_delivery_duration")
        delivery_columns = {row[0] for row in cursor.fetchall()}

        if "delivery_type" not in delivery_columns:
            cursor.execute(
                "ALTER TABLE core_delivery_duration "
                "ADD COLUMN delivery_type VARCHAR(20) NOT NULL DEFAULT 'STANDARD'"
            )
        if "extra_charge" not in delivery_columns:
            cursor.execute(
                "ALTER TABLE core_delivery_duration "
                "ADD COLUMN extra_charge NUMERIC(12,2) NOT NULL DEFAULT 0"
            )
        if "is_active" not in delivery_columns:
            cursor.execute(
                "ALTER TABLE core_delivery_duration "
                "ADD COLUMN is_active BOOL NOT NULL DEFAULT TRUE"
            )

        cursor.execute("SHOW COLUMNS FROM core_payment_transaction")
        payment_columns = {row[0] for row in cursor.fetchall()}
        if "delivery_duration_id_ref" not in payment_columns:
            cursor.execute(
                "ALTER TABLE core_payment_transaction "
                "ADD COLUMN delivery_duration_id_ref INTEGER NULL"
            )


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0034_merge_0032_payment_transaction_intent_fields_0033_user_notification_preference"),
    ]

    operations = [
        migrations.RunPython(add_missing_delivery_columns, noop_reverse),
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AddField(
                    model_name="deliveryduration",
                    name="delivery_type",
                    field=models.CharField(
                        choices=[
                            ("STANDARD", "Standard Delivery"),
                            ("SAME_DAY", "Same Day Delivery"),
                            ("EXPRESS", "Express Delivery"),
                        ],
                        db_index=True,
                        default="STANDARD",
                        max_length=20,
                    ),
                ),
                migrations.AddField(
                    model_name="deliveryduration",
                    name="extra_charge",
                    field=models.DecimalField(
                        decimal_places=2,
                        default=0,
                        help_text="Additional charge (BDT) over the base delivery fee for this option.",
                        max_digits=12,
                    ),
                ),
                migrations.AddField(
                    model_name="deliveryduration",
                    name="is_active",
                    field=models.BooleanField(db_index=True, default=True),
                ),
                migrations.AddField(
                    model_name="paymenttransaction",
                    name="delivery_duration_id_ref",
                    field=models.PositiveIntegerField(blank=True, null=True),
                ),
            ],
        ),
        migrations.RunPython(seed_default_delivery_options, noop_reverse),
    ]
