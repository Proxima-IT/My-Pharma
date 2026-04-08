from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0026_user_notification"),
    ]

    operations = [
        migrations.AddField(
            model_name="blogpost",
            name="short_description",
            field=models.TextField(blank=True, help_text="Short summary for listing cards and SEO."),
        ),
        migrations.AddField(
            model_name="blogpost",
            name="article_image",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to="blog/%Y/%m/",
                help_text="Hero image for the article.",
            ),
        ),
    ]

