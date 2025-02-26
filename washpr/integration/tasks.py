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
        print("Client params:", params)
        response = self.call_api(url, http_method="POST", params=params)
        if response:
            print("Client created successfully:", response)
            return response
        else:
            print("Failed to create client.")
            return None

    def create_client_place(self, client_external_id, place_external_id, place_title,
                            place_country, place_city, place_street, place_number,
                            place_zip, contact_person_name, contact_person_phone,
                            contact_person_email, lat, lng):
        url = "https://online.auto-gps.eu/cnt/apiItinerary/clientPlace"
        params = {
            "client_external_id": client_external_id,
            "place_external_id": place_external_id,
            "place_title": place_title,
            "place_country": place_country,
            "place_city": place_city,
            "place_street": place_street,
            "place_number": place_number,
            "place_zip": place_zip,
            "contact_person_name": contact_person_name,
            "contact_person_phone": contact_person_phone,
            "contact_person_email": contact_person_email,
            "lat": lat,
            "lng": lng,
        }
        print("Place params:", params)
        response = self.call_api(url, http_method="POST", params=params)
        if response:
            print("Place created successfully:", response)
            return response
        else:
            print("Failed to create place.")
            return None

@shared_task
def create_client_task(customer_id):
    """
    Задача создания клиента во внешней системе.
    Если ответ содержит "id", сохраняется rp_client_id и отправляется подтверждающее письмо.
    """
    from customer.models import Customer
    close_old_connections()
    try:
        customer = Customer.objects.get(pk=customer_id)
    except Customer.DoesNotExist:
        return f"Customer with id {customer_id} not found."

    api_key = settings.EXTERNAL_API_KEY
    api_client = RestApiClient(api_key)

    client_external_id = customer.rp_client_external_id or f"customer_{customer.pk}"
    client_name = customer.company_name

    response = api_client.create_client(client_external_id, client_name)
    print(f"Create client response: {response}")

    if response and "id" in response:
        client_id = response["id"]
        customer.rp_client_id = client_id
        customer.data_sent = True
        customer.save(update_fields=["rp_client_id", "data_sent"])

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

@shared_task
def create_place_task(place_id):
    """
    Задача отправки данных места во внешнюю систему.
    После успешного ответа (наличие поля "id") обновляет модель Place, сохраняя remote_id.
    """
    close_old_connections()
    from place.models import Place  # Предполагается, что модель Place в приложении place
    try:
        place = Place.objects.get(pk=place_id)
    except Place.DoesNotExist:
        return f"Place with id {place_id} not found."

    # Предполагается, что у модели Place есть внешний ключ customer
    customer = place.customer
    api_key = settings.EXTERNAL_API_KEY
    api_client = RestApiClient(api_key)

    client_external_id = customer.rp_client_external_id
    place_external_id = f"place_{place.pk}"
    response = api_client.create_client_place(
        client_external_id=client_external_id,
        place_external_id=place_external_id,
        place_title=place.place_name,
        place_country="",
        place_city=place.rp_city,
        place_street=place.rp_street,
        place_number=place.rp_number,
        place_zip=place.rp_zip,
        contact_person_name=place.rp_person,
        contact_person_phone=place.rp_phone,
        contact_person_email=place.rp_email,
        lat=48.5639756,
        lng=19.8449609,
    )
    print(f"Create place response: {response}")
    if response and "id" in response:
        place.rp_id = response["id"]
        place.active = True
        place.save(update_fields=["rp_id", "active"])
        return f"Place {place_id} created with remote id {response['id']}."
    else:
        return f"Failed to create place {place_id}."