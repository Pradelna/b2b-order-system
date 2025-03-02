import time
from datetime import datetime, time, timedelta
from .utils import get_dates_by_weekdays

import requests
from celery import shared_task
from celery.exceptions import MaxRetriesExceededError
from django.conf import settings
from django.db import close_old_connections
from django.core.mail import send_mail
from django.utils import timezone


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
    # place_external_id = place.place_external_id or f"place_{place.pk}"
    response = api_client.create_client_place(
        client_external_id=client_external_id,
        place_external_id=place.rp_external_id,
        place_title=place.place_name,
        place_country="",
        place_city=place.rp_city,
        place_street=place.rp_street,
        place_number=place.rp_number,
        place_zip=place.rp_zip,
        contact_person_name=place.rp_person,
        contact_person_phone=place.rp_phone,
        contact_person_email=place.rp_email,
    )
    print(f"Create place response: {response}")
    if response and "id" in response:
        place.rp_id = response["id"]
        place.active = True
        place.save(update_fields=["rp_id", "active"])
        return f"Place {place_id} created with remote id {response['id']}."
    else:
        return f"Failed to create place {place_id}."


@shared_task
def send_orders_task():
    """
    Задача запускается каждый час и выбирает заказы, которые:
      - Ещё не были отправлены (reported=False)
      - Созданы более 35 минут назад
    Для каждого заказа отправляется запрос на https://online.auto-gps.eu/cnt/apiItinerary/contractAdd.
    При успешном ответе (наличие поля "id" в ответе) заказ помечается как отправленный (reported=True).
    """
    close_old_connections()
    from order.models import Order  # Импортируем модель заказа из приложения order

    # Выбираем заказы, не отправленные ранее и созданные более 35 минут назад
    time_threshold = timezone.now() - timedelta(minutes=2)
    orders = Order.objects.filter(active=False, created_at__lte=time_threshold)

    api_key = settings.EXTERNAL_API_KEY
    api_client = RestApiClient(api_key)
    results = []

    for order in orders:
        # Формируем payload для заказа. Приводим поля к нужному типу,
        # заполняем отсутствующие поля пустыми строками или значениями по умолчанию.
        payload = {
            "contract_external_id": order.rp_contract_external_id if order.rp_contract_external_id else f"order_{order.pk}",
            "place_external_id": order.rp_place_external_id or order.place.rp_external_id,
            "contract_title": order.rp_contract_title or None,
            "time_planned": order.rp_time_planned or None,
            "customer_note": order.rp_customer_note or None,
            "client_external_id": order.rp_client_external_id or None,
            "place_title": order.rp_place_title or None,
            "place_city": order.rp_place_city or None,
            "place_street": order.rp_place_street or None,
            "place_number": order.rp_place_number or None,
            "place_zip": order.rp_place_zip or None,
            "place_country": "CZ",
            "branch_office_id": order.rp_branch_office_id or None,
        }
        # URL для отправки заказа
        url = "https://online.auto-gps.eu/cnt/apiItinerary/serviceOrder"
        print(f"Sending order {order.pk} with payload: {payload}")
        response = api_client.call_api(url, http_method="POST", params=payload)
        if response and "id" in response:
            order.active = True
            order.rp_id = response["id"]
            order.save(update_fields=["active", "rp_id"])
            results.append(f"Order {order.pk} sent successfully with external id {response['id']}.")
        else:
            results.append(f"Failed to send order {order.pk}.")
    return results


@shared_task
def create_orders_task():
    """
    Задача запускается каждый час и выбирает заказы, которые:
      - Ещё не были отправлены (reported=False)
      - Созданы более 35 минут назад
    """
    close_old_connections()
    from order.models import Order  # Импортируем модель заказа из приложения order

    # Выбираем заказы, не отправленные ранее и созданные более 35 минут назад
    time_threshold = timezone.now() - timedelta(minutes=2)
    orders = Order.objects.filter(processed=False, main_order=True, created_at__lte=time_threshold)
    print(len(orders), orders)

    results = []

    for order in orders:
        base_order_data = {
            'place': order.place,
            'user': order.user,
            'group_month_id': order.group_month_id,
            'type_ship': order.type_ship,
            'system': order.system,
            # 'rp_client_external_id': order.rp_client_external_id,
            # 'rp_place_external_id': order.rp_place_external_id,
            # 'rp_place_title': order.rp_place_title,
            # 'rp_place_city': order.rp_place_city,
            # 'rp_place_street': order.rp_place_street,
            # 'rp_place_number': order.rp_place_number,
            # 'rp_place_zip': order.rp_place_zip,
            # 'rp_place_email': order.rp_place_email,
            # 'rp_place_person': order.rp_place_person,
            # 'rp_place_phone': order.rp_place_phone,
            # 'rp_contract_title': order.rp_contract_title,
            'rp_status': 0,
            'every_week': order.every_week,
            'processed': True,
        }
        # заполняем отсутствующие поля пустыми строками или значениями по умолчанию.
        if order.type_ship == 'pickup_ship_one' or order.type_ship == 'pickup_ship_dif':
            print("pickup_ship_one")
            order_date = int(datetime.combine(order.date_start_day, time()).timestamp())
            order.rp_time_realization = order_date # date when courier to come
            days_list = [] # days when courier has to come
            if order.system == 'Own':
                print("Own")
                if order.monday:
                    days_list.append(0)
                if order.tuesday:
                    days_list.append(1)
                if order.wednesday:
                    days_list.append(2)
                if order.thursday:
                    days_list.append(3)
                if order.friday:
                    days_list.append(4)
            elif order.system == 'Mon_Wed_Fri':
                days_list = [0,2,4]
            elif order.system == 'Tue_Thu':
                print("tuesday thusday")
                days_list = [1,3]
            elif order.system == 'Every_day':
                print("Every_day")
                days_list = [0,1,2,3,4]
            new_order_dates = get_dates_by_weekdays(order.date_start_day, days_list)
            print(len(new_order_dates), new_order_dates)
            group_pair_id = None
            new_order_pk = 0
            for idx, date in enumerate(new_order_dates):
                print(f"{idx}: {date} order {order.pk}")
                if idx == 0:
                    group_pair_id = order.group_pair_id # id of main order
                else:
                    group_pair_id = new_order_pk # id of previous order
                if idx % 2 == 0: # even = delivery, odd = pickup
                    print("even")
                    base_order_data.update({
                        'rp_time_planned': int(datetime.combine(date, time()).timestamp()),  # заменим позже, если нужно
                        'date_start_day': date,  # для нового заказа
                        'rp_customer_note': "delivery",
                        'date_pickup': order.date_start_day,  # дата предыдущего заказа
                        'date_delivery': date,             # текущая дата
                        'delivery': True,
                        'pickup': False,
                        'group_pair_id': group_pair_id,
                    })
                else:
                    print("odd")
                    base_order_data.update({
                        'rp_time_planned': int(datetime.combine(date, time()).timestamp()),
                        'date_start_day': date,  # для нового заказа
                        'rp_customer_note': "pickup",
                        'date_pickup': date,  # текущая дата
                        'pickup': True,
                        'delivery': False,
                    })
                new_order = Order(**base_order_data)
                new_order.save()
                print("success")
                new_order_pk = new_order.pk
                results.append(new_order.pk)

        elif order.type_ship == 'one_time' or order.type_ship == 'quick_order':
            date = order.date_delivery
            base_order_data.update({
                'rp_time_planned': int(datetime.combine(date, time()).timestamp()),
                'date_start_day': order.date_pickup,  # дата предыдущего заказа
                'date_pickup': order.date_pickup,  # дата предыдущего заказа
                'date_delivery': date,             # текущая дата
                'delivery': True,
                'pickup': False,
                'group_pair_id': order.group_pair_id,
            })
            new_order = Order(**base_order_data)
            new_order.save()
            print("success")
        order.processed = True
        order.save(update_fields=["processed"])
    return results

