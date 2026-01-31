"""
Authentication App Configuration
"""

from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    """Configuration for the authentication application."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'
    verbose_name = 'Authentication & Authorization'
    
    def ready(self):
        """
        Called when the application is ready.
        Import signals to register them.
        """
        import authentication.signals  # noqa: F401
