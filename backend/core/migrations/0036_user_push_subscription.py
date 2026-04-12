from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0035_delivery_options_and_charges"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="UserPushSubscription",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("endpoint", models.URLField(max_length=1000, unique=True)),
                ("p256dh", models.CharField(max_length=255)),
                ("auth", models.CharField(max_length=255)),
                ("is_active", models.BooleanField(db_index=True, default=True)),
                ("last_seen_at", models.DateTimeField(auto_now=True)),
                ("user_agent", models.CharField(blank=True, max_length=500)),
                ("platform", models.CharField(blank=True, max_length=100)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="push_subscriptions", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "db_table": "core_user_push_subscription",
                "ordering": ["-updated_at"],
            },
        ),
        migrations.AddIndex(
            model_name="userpushsubscription",
            index=models.Index(fields=["user", "is_active"], name="core_user_p_user_id_2d704d_idx"),
        ),
        migrations.AddIndex(
            model_name="userpushsubscription",
            index=models.Index(fields=["user", "updated_at"], name="core_user_p_user_id_2a4d93_idx"),
        ),
    ]
