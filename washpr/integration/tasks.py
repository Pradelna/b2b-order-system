import time
import requests
from celery import shared_task
from celery.exceptions import MaxRetriesExceededError
from django.conf import settings
from django.db import close_old_connections
from django.core.mail import send_mail


# Класс для работы с внешним API
class RestApiClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.retry_after = None

    def call_api(self, url, http_method="GET", params=None):
        if self.retry_after and time.time() < self.retry_after:
            print("Rate limit exceeded. Please wait.")
            return None

        headers = {
            "X-API-KEY": self.api_key,
            "accept": "application/json"
        }

        try:
            response = requests.request(http_method, url, headers=headers, params=params)
            self.handle_headers(response)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            return None

    def handle_headers(self, response):
        if response.status_code == 429:
            retry_after = int(response.headers.get('Retry-After', 0))
            self.retry_after = time.time() + retry_after
            print(f"Rate limited. Retry after {retry_after} seconds.")

    def create_client(self, client_external_id, client_name):
        url = "https://online.auto-gps.eu/cnt/apiItinerary/client"
        params = {
            "client_external_id": client_external_id,
            "client_name": client_name
        }
        print(params)
        response = self.call_api(url, http_method="POST", params=params)
        if response:
            print("Client created successfully:", response)
            return response
        else:
            print("Failed to create client.")
            return None


@shared_task
def create_client_task(customer_id):
    """
    Задача, которая вызывается при активации клиента.
    Она отправляет данные во внешнюю систему, получает ответ, и если клиент успешно создан,
    сохраняет внешний id в поле rp_client_id и отправляет подтверждающее письмо.
    """
    from customer.models import Customer
    close_old_connections()
    try:
        customer = Customer.objects.get(pk=customer_id)
    except Customer.DoesNotExist:
        return f"Customer with id {customer_id} not found."

    api_key = settings.EXTERNAL_API_KEY  # API-ключ должен быть задан в settings.py
    api_client = RestApiClient(api_key)

    client_external_id = customer.rp_client_external_id or f"customer_{customer.pk}"
    client_name = customer.company_name

    response = api_client.create_client(client_external_id, client_name)
    print(f"Create client response: {response}")

    if response and "id" in response:
        client_id = response["id"]
        # Сохраняем внешний id в модели
        customer.rp_client_id = client_id
        customer.data_sent = True
        customer.save(update_fields=["rp_client_id", "data_sent"])

        # Отправляем письмо с подтверждением
        subject = "Ваш аккаунт активирован"
        message = (
            f"Здравствуйте, {customer.company_person or customer.company_name}!\n\n"
            f"Ваш аккаунт активен и успешно создан во внешней системе.\n"
            f"Внешний ID: {client_id}"
        )
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [customer.user.email]
        send_mail(subject, message, from_email, recipient_list)
        print(f"Confirmation email sent to {customer.user.email}")
        return f"Client created and email sent for customer {customer_id} with external client id {client_id}."
    else:
        return f"Failed to create client for customer {customer_id}."
