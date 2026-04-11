# Merge two migration heads so `migrate` succeeds in Docker/dev.
# Branches: 0027_merge_... (merge of blog/user-notification tree) vs 0029_product_is_generic (via 0028).

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0027_merge_0025_merge_20260317_1649_0026_user_notification"),
        ("core", "0029_product_is_generic"),
    ]

    operations = []
