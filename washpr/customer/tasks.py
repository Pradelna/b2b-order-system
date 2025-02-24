from celery import shared_task
import requests
from django.conf import settings
from django.core.mail import send_mail
from django.db import close_old_connections


@shared_task
def send_customer_registration_data(customer_id):
    from .models import Customer
    # Закрываем устаревшие соединения с БД для предотвращения проблем в воркере
    close_old_connections()

    try:
        customer = Customer.objects.get(pk=customer_id)
        print(customer.company_name)
    except Customer.DoesNotExist:
        return f"Клиент с id {customer_id} не найден."

    data = {
        'company name': customer.company_name,
        'email': customer.company_email,
    }

    subject = "Ваш аккаунт активирован"
    message = f"Здравствуйте, {customer.company_person}! Ваш аккаунт теперь активен."
    from_email = settings.DEFAULT_FROM_EMAIL  # Убедитесь, что это значение прописано в settings.py
    recipient_list = [customer.company_email]

    try:
        send_mail(subject, message, from_email, recipient_list)
        response = requests.post(settings.EXTERNAL_REGISTRATION_API_URL, json=data)
        response.raise_for_status()
        return f"Данные регистрации успешно отправлены для клиента {customer_id}."
    except requests.RequestException as e:
        return f"Ошибка при отправке данных для клиента {customer_id}: {e}"