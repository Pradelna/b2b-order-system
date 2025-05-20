from django.apps import AppConfig


class PlaceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'place'

    def ready(self):
        import place.signals
