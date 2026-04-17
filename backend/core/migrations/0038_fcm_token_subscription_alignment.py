from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0037_remove_productreview_core_product_review_user_product_uniq_and_more"),
    ]

    operations = [
        migrations.RenameField(
            model_name="userpushsubscription",
            old_name="endpoint",
            new_name="fcm_token",
        ),
        migrations.AlterField(
            model_name="userpushsubscription",
            name="fcm_token",
            field=models.CharField(max_length=500, unique=True),
        ),
        migrations.RemoveField(
            model_name="userpushsubscription",
            name="p256dh",
        ),
        migrations.RemoveField(
            model_name="userpushsubscription",
            name="auth",
        ),
    ]
