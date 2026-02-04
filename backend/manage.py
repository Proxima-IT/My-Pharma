#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

# Ensure the backend directory (containing my_pharma) is first on the path
_BACKEND_DIR = os.path.realpath(os.path.dirname(os.path.abspath(__file__)))
# Remove if present (may be same path in different form) so we can insert at 0
sys.path = [p for p in sys.path if os.path.realpath(p) != _BACKEND_DIR]
sys.path.insert(0, _BACKEND_DIR)


def main():
    # Subprocesses (e.g. auto-reload) may need PYTHONPATH to find my_pharma
    pythonpath = os.environ.get("PYTHONPATH", "")
    if _BACKEND_DIR not in pythonpath.split(os.pathsep):
        os.environ["PYTHONPATH"] = _BACKEND_DIR + (os.pathsep + pythonpath if pythonpath else "")
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_pharma.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
