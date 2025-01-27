from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Customer


@receiver(post_save, sender=User)
def create_customer_for_user(sender, instance, created, **kwargs):
    if created:
        # Создаем объект Customer при создании User
        Customer.objects.create(
            user=instance,
            company_name="",  # Значения по умолчанию
            company_address="",
            company_ico="",
            company_phone="",
            company_email=instance.email,  # Можно взять email из User
            # company_person=instance.username,  # Можно взять username из User
        )
