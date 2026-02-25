# Rename delivery_area to district

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0012_address_fields_full_name_email_phone_gender_district_thana"),
    ]

    operations = [
        migrations.RenameField(
            model_name="useraddress",
            old_name="delivery_area",
            new_name="district",
        ),
    ]
