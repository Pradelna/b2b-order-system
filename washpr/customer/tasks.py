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
        response = self.call_api(url, http_method="POST", params=params)
        if response:
            print("Client created successfully:", response)
            return response
        else:
            print("Failed to create client.")
            return None

    def check_client(self, client_external_id):
        """
        Метод для опроса API, чтобы проверить, существует ли клиент.
        Предполагается, что API при GET-запросе с client_external_id возвращает данные клиента.
        """
        url = "https://online.auto-gps.eu/cnt/apiItinerary/client"
        params = {"client_external_id": client_external_id}
        response = self.call_api(url, http_method="GET", params=params)
        return response


@shared_task
def create_client_task(customer_id):
    """
    Задача, которая вызывается при активации клиента.
    Создаёт клиента через внешний API, а затем запускает задачу опроса API для подтверждения создания.
    """
    from .models import Customer
    close_old_connections()
    try:
        customer = Customer.objects.get(pk=customer_id)
    except Customer.DoesNotExist:
        return f"Customer with id {customer_id} not found."

    api_key = settings.EXTERNAL_API_KEY  # API-ключ из настроек
    api_client = RestApiClient(api_key)

    # Определяем уникальный внешний идентификатор клиента.
    client_external_id = customer.rp_client_external_id or f"customer_{customer.pk}"
    name = customer.company_name

    # Создание клиента через API
    result = api_client.create_client(client_external_id, name)
    print(f"Create client result: {result}")

    # После вызова API запускаем задачу опроса для подтверждения создания
    poll_client_and_send_email_task.delay(customer.pk, client_external_id)

    return result


@shared_task(bind=True, max_retries=5, default_retry_delay=60)
def poll_client_and_send_email_task(self, customer_id, client_external_id):
    """
    Опрос API по адресу /cnt/apiItinerary/clientlist с пагинацией.
    Перебираем страницы с limit и offset (пределы задаются в settings.py).
    Если в списке найден клиент с external_id равным client_external_id,
    сохраняем его id в базе (в поле rp_client_id) и отправляем письмо.
    Если клиент не найден, задача повторяется через 60 секунд (до 5 раз).
    """
    from .models import Customer
    close_old_connections()
    try:
        customer = Customer.objects.get(pk=customer_id)
    except Customer.DoesNotExist:
        return f"Customer with id {customer_id} not found."

    api_key = settings.EXTERNAL_API_KEY
    api_client = RestApiClient(api_key)

    limit = getattr(settings, 'EXTERNAL_CLIENTLIST_LIMIT', 1000)
    max_items = getattr(settings, 'EXTERNAL_CLIENTLIST_MAX_ITEMS', 5000)
    found_client_id = None

    # Перебираем страницы с шагом limit
    for offset in range(0, max_items, limit):
        url = f"https://online.auto-gps.eu/cnt/apiItinerary/clientlist?limit={limit}&offset={offset}"
        response = api_client.call_api(url, http_method="GET")
        print(f"Polling API with offset={offset}: {response}")
        if response:
            for client in response:
                if client.get("external_id") == client_external_id:
                    found_client_id = client.get("id")
                    break
        if found_client_id:
            break

    if found_client_id:
        # Сохраняем внешний ID в модели
        customer.rp_client_id = found_client_id
        customer.save(update_fields=['rp_client_id'])

        subject = "Ваш аккаунт активирован"
        message = (
            f"Здравствуйте, {customer.company_person or customer.company_name}!\n\n"
            f"Ваш аккаунт активен и успешно создан во внешней системе.\n"
            f"Внешний ID: {found_client_id}"
        )
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [customer.user.email]
        send_mail(subject, message, from_email, recipient_list)
        print(f"Confirmation email sent to {customer.user.email}")
        return f"Confirmation email sent for customer {customer_id} with external client id {found_client_id}."
    else:
        try:
            raise self.retry()
        except MaxRetriesExceededError:
            return f"Polling failed for customer {customer_id} after maximum retries."
