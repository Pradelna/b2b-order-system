import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Place
from integration.tasks import create_place_task

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Place)
def trigger_create_place_task(sender, instance, created, **kwargs):
    if created:
        logger.info(f"New Place created with id {instance.pk}. Triggering create_place_task.")
        # Можно также вывести отладочное сообщение в консоль:
        print(f"DEBUG: New Place created with id {instance.pk}. Triggering create_place_task.")
        # Запускаем задачу асинхронно:
        create_place_task.delay(instance.pk)
