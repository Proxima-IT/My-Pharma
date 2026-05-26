"""
Management command to fix user phone numbers that were stored with the wrong
country code prefix "88" (instead of "880") due to the original normalize_phone bug.

The buggy code (fixed now) was:
    digits = "88" + digits[1:]   # should be "880" + digits[1:]

This caused BD phone numbers like "01728181464" to be stored as "881728181464"
instead of "8801728181464".

Usage:
    python manage.py fix_phone_prefix          # dry-run (preview only)
    python manage.py fix_phone_prefix --apply   # actually fix records
    python manage.py fix_phone_prefix --apply --user-id 42  # fix specific user
"""
import re
from django.core.management.base import BaseCommand
from django.db import transaction
from authentication.models import User, UserAddress


# Pattern: phone starts with "88" followed by a BD operator prefix (1, 3, 5, 6, 7, 8, 9)
# and is exactly 12 digits (i.e., missing one zero from the "880" prefix).
WRONG_PREFIX_RE = re.compile(r"^88([1-9]\d{9})$")  # "88" + 10 digits = 12 chars


def fix_phone(phone: str) -> str | None:
    """Fix a single phone number. Returns corrected phone or None if no fix needed."""
    digits = "".join(c for c in phone if c.isdigit())
    m = WRONG_PREFIX_RE.match(digits)
    if m:
        return "880" + m.group(1)  # "88" + remaining → "880" + remaining
    return None


class Command(BaseCommand):
    help = "Fix user phone numbers stored with wrong '88' country code prefix (should be '880')."

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            dest="apply",
            help="Actually apply fixes. Without this flag, only a dry-run is performed.",
        )
        parser.add_argument(
            "--user-id",
            type=int,
            dest="user_id",
            default=None,
            help="Only fix a specific user by ID.",
        )

    def handle(self, *args, **options):
        apply = options["apply"]
        user_id = options["user_id"]

        qs = User.objects.exclude(phone="").exclude(phone__isnull=True).exclude(deleted_at__isnull=False)
        if user_id:
            qs = qs.filter(pk=user_id)

        fixes = []
        for user in qs:
            corrected = fix_phone(user.phone)
            if corrected and corrected != user.phone:
                fixes.append((user, user.phone, corrected))

        if not fixes:
            self.stdout.write(self.style.SUCCESS("No phone numbers need fixing."))
            return

        self.stdout.write(f"Found {len(fixes)} phone number(s) to fix:\n")
        for user, old, new in fixes:
            self.stdout.write(f"  User ID={user.id:5d}  {old}  >>  {new}")
        self.stdout.write("")

        if not apply:
            self.stdout.write(
                self.style.WARNING("DRY-RUN: No changes applied. Re-run with --apply to fix.")
            )
            return

        # Apply fixes
        with transaction.atomic():
            for user, old, new in fixes:
                # Check that the corrected phone isn't already taken by another user
                conflict = (
                    User.objects.filter(phone=new)
                    .exclude(pk=user.pk)
                    .exclude(deleted_at__isnull=False)
                    .first()
                )
                if conflict:
                    self.stderr.write(
                        self.style.ERROR(
                            f"  SKIP User ID={user.id}: corrected phone {new} "
                            f"already exists for User ID={conflict.id}"
                        )
                    )
                    continue

                user.phone = new
                user.save(update_fields=["phone", "updated_at"])
                self.stdout.write(self.style.SUCCESS(f"  FIXED User ID={user.id}: {old} >> {new}"))

            # Also fix phone numbers in UserAddress records
            addr_qs = UserAddress.objects.exclude(phone="").exclude(phone__isnull=True)
            addr_fixes = 0
            for addr in addr_qs:
                corrected = fix_phone(addr.phone)
                if corrected and corrected != addr.phone:
                    addr.phone = corrected
                    addr.save(update_fields=["phone"])
                    addr_fixes += 1

            if addr_fixes:
                self.stdout.write(self.style.SUCCESS(f"  Fixed {addr_fixes} address phone number(s)"))

        self.stdout.write(self.style.SUCCESS("\nDone."))
