# Generated manually for BlogCategory and BlogPost

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0024_order_discount_breakdown"),
    ]

    operations = [
        migrations.CreateModel(
            name="BlogCategory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("slug", models.SlugField(db_index=True, max_length=100, unique=True)),
                ("is_active", models.BooleanField(default=True)),
                (
                    "order",
                    models.PositiveSmallIntegerField(
                        default=0, help_text="Display order; lower first."
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "core_blog_category",
                "ordering": ["order", "name"],
                "verbose_name_plural": "Blog categories",
            },
        ),
        migrations.CreateModel(
            name="BlogPost",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("slug", models.SlugField(db_index=True, max_length=255, unique=True)),
                (
                    "content",
                    models.TextField(help_text="Article body (plain text or HTML)."),
                ),
                ("is_published", models.BooleanField(db_index=True, default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "category",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="posts",
                        to="core.blogcategory",
                    ),
                ),
            ],
            options={
                "db_table": "core_blog_post",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="blogpost",
            index=models.Index(fields=["category", "created_at"], name="core_blog_p_categor_16b55f_idx"),
        ),
    ]
