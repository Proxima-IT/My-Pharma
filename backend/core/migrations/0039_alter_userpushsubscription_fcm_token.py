from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0038_fcm_token_subscription_alignment"),
    ]

    operations = [
        migrations.AlterField(
            model_name="userpushsubscription",
            name="fcm_token",
            field=models.CharField(max_length=255, unique=True),
        ),
    ]
