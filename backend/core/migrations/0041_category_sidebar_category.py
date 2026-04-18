from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0040_category_featured_order_category_is_featured_home_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="category",
            name="sidebar_category",
            field=models.ForeignKey(
                blank=True,
                db_index=True,
                help_text="Optional custom sidebar menu parent for this category.",
                null=True,
                on_delete=models.SET_NULL,
                related_name="categories",
                to="core.sidebarcategory",
            ),
        ),
    ]
