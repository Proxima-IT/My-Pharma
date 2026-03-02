"""
Prescription validation rules per PRESCRIPTION_MANAGEMENT.md.
- File: JPG, PNG, PDF only; max 10MB.
- Validity: issue_date not older than 6 months.
"""
from datetime import date, timedelta
from django.core.exceptions import ValidationError


PRESCRIPTION_MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
PRESCRIPTION_ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
}
PRESCRIPTION_ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}
PRESCRIPTION_MAX_AGE_MONTHS = 6


def validate_prescription_file(file):
    """Rule 1: Accept only JPG, PNG, PDF with max size 10MB."""
    if file is None:
        raise ValidationError("No file provided.")
    if getattr(file, "size", 0) > PRESCRIPTION_MAX_SIZE_BYTES:
        raise ValidationError(
            f"File size must not exceed {PRESCRIPTION_MAX_SIZE_BYTES // (1024 * 1024)}MB."
        )
    name = (getattr(file, "name", "") or "").lower()
    content_type = (getattr(file, "content_type", "") or "").lower()
    if content_type and content_type not in PRESCRIPTION_ALLOWED_CONTENT_TYPES:
        if not any(name.endswith(ext) for ext in PRESCRIPTION_ALLOWED_EXTENSIONS):
            raise ValidationError("Allowed formats: JPG, PNG, PDF only.")
    if name and not any(name.endswith(ext) for ext in PRESCRIPTION_ALLOWED_EXTENSIONS):
        raise ValidationError("Allowed formats: JPG, PNG, PDF only.")


def validate_issue_date_not_older_than_six_months(issue_date):
    """Rule 2: Prescription must not be older than 6 months from issue date."""
    if issue_date is None:
        return
    cutoff = date.today() - timedelta(days=PRESCRIPTION_MAX_AGE_MONTHS * 31)
    if issue_date < cutoff:
        raise ValidationError(
            f"Prescription issue date must not be older than {PRESCRIPTION_MAX_AGE_MONTHS} months."
        )
