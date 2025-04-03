from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Customer
User = get_user_model()


@receiver(post_save, sender=User)
def create_customer_for_user(sender, instance, created, **kwargs):
    print("create_customer_for_user")
    if created:
        # Создаем объект Customer при создании User
        Customer.objects.create(
            user=instance,
            company_name="",  # Значения по умолчанию
            company_address="",
            company_ico="",
            company_phone="",
            company_email=instance.email,
        )
        raise Exception("🔥 сигнал сработал!")
