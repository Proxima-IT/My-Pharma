# Generated manually for generic-alternative suggestions.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0028_order_settlement_and_b2b"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="is_generic",
            field=models.BooleanField(
                db_index=True,
                default=False,
                help_text="True for generic/unbranded equivalents; used to suggest lower-cost alternatives for the same active ingredient.",
            ),
        ),
    ]
