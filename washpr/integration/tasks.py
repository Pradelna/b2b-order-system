import json
from collections import defaultdict
from datetime import datetime, time, timedelta
import time as ptime
from django.core.files.base import ContentFile

from django.contrib.messages import success

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

    def call_api(self, url, http_method="GET", params=None, raw=False):
        if self.retry_after and ptime.time() < self.retry_after:
            print("Rate limit exceeded. Please wait.")
            return None

        headers = {
            "X-API-KEY": self.api_key,
            "accept": "*/*" if raw else "application/json"
        }

        try:
            response = requests.request(http_method, url, headers=headers, params=params)
            self.handle_headers(response)
            response.raise_for_status()
            if raw:
                return response
            else:
                return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            return None

    def handle_headers(self, response):
        if response.status_code == 429:
            retry_after = int(response.headers.get('Retry-After', 0))
            self.retry_after = ptime.time() + retry_after
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

        create_all_place_task.delay(customer_id)

        subject = "Váš účet byl aktivován"
        message = (
            f"Dobrý den, {customer.company_person or customer.company_name}!\n\n"
            f"Váš účet je aktivní a úspěšně vytvořen ve.\n"
            f"Vaš ID: {client_id}"
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
    if customer.active and customer.data_sent:
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
            lat=None,
            lng=None,
        )
        print(f"Create place response: {response}")
        if response and "id" in response:
            place.rp_id = response["id"]
            place.data_sent = True
            place.save(update_fields=["rp_id", "data_sent"])
            return f"Place {place_id} created with remote id {response['id']}."
        else:
            return f"Failed to create place {place_id}."

    else:
        return f"Customer is not active yet"


@shared_task
def create_all_place_task(customer_id):
    """
    Задача отправки данных всех мест во внешнюю систему.
    После успешного ответа обновляет модель Place, сохраняя remote_id.
    """
    close_old_connections()
    from place.models import Place  # Предполагается, что модель Place в приложении place
    try:
        places = Place.objects.filter(customer__id=customer_id, data_sent=False)
    except Place.DoesNotExist:
        return f"Place with active=Flase not found."

    api_key = settings.EXTERNAL_API_KEY
    api_client = RestApiClient(api_key)

    result = []


    if len(places) != 0:
        for place in places:
            customer = place.customer
            client_external_id = customer.rp_client_external_id
            response = api_client.create_client_place(
                client_external_id=place.customer.rp_client_external_id,
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
                lat=None,
                lng=None,
            )
            print(f"Create place response: {response}")
            if response and "id" in response:
                place.rp_id = response["id"]
                place.data_sent = True
                place.save(update_fields=["rp_id", "data_sent"])
                result.append(f"✅ Place {place.place_name} created with remote id {response['id']}.")
            else:
                result.append(f"❌ Failed to create place {place.place_name}.")

    return result



@shared_task
def send_orders_task():
    """
    Задача запускается каждый час и выбирает заказы, которые:
      - Ещё не были отправлены (reported=False)
      - Созданы более 35 минут назад
    Для каждого заказа отправляется запрос на https://online.auto-gps.eu/cnt/apiItinerary/contractAdd.
    При успешном ответе (наличие поля "id" в ответе) заказ помечается как отправленный (reported=True).
    """

    api_key = settings.EXTERNAL_API_KEY
    api_client = RestApiClient(api_key)
    # get order from route plane
    # dictionary for order external_id for each date
    orders_data_from_rp = []
    success_get = False

    import requests

    url = "https://online.auto-gps.eu/cnt/apiItinerary/contractList"
    params = {
        "show_closed": 0,
        "last_status_change": 86400,
        "limit": 300,
        "offset": 0,
    }

    try:
        response = api_client.call_api(url, http_method="GET", params=params)
        # print("API Response:", response)
        orders_data_from_rp = response
        success_get = True
    except requests.exceptions.RequestException as e:
        print("API Request failed:", e)

    close_old_connections()
    from order.models import Order  # Импортируем модель заказа из приложения order

    # Выбираем заказы, не отправленные ранее и созданные более 35 минут назад
    time_threshold = timezone.now() - timedelta(minutes=2)
    orders = Order.objects.filter(active=False, created_at__lte=time_threshold)

    # print(f"Orders after {time_threshold}: {orders}")
    # find out oldest order
    min_order = min(orders, key=lambda order: order.rp_time_planned) if orders else None
    # min time for time slice
    min_time = min_order.rp_time_planned if min_order else 0

    # print(f"220 min_time: {min_time}")
    # dictionary for max external_id {'01-03-2025': 7}
    max_external_number_by_day = defaultdict(int)
    if orders_data_from_rp:
        for item in orders_data_from_rp:
            time_planned = item["time_planned"]
            # print(f"time_planned 225: {time_planned}")
            # use only date from min_time until now
            if time_planned >= min_time:
                external_id = item["external_id"]
                # print(f"229 {time_planned} >= {min_time}. External ID: {external_id}")

                # Преобразуем timestamp в формат DD-MM-YYYY
                date_str = datetime.utcfromtimestamp(time_planned).strftime('%d%m%y')
                # print(f"233 Date: {date_str}")

                # Извлекаем число после "/"
                try:
                    external_number = int(external_id.split("/")[-1])
                    # print(f"238 External number: {external_number}")
                except ValueError:
                    external_number = 0  # Если не удалось извлечь число

                # Обновляем максимум для конкретного дня
                max_external_number_by_day[date_str] = max(max_external_number_by_day[date_str], external_number)

        # print(f"245 max_externel: {max_external_number_by_day}")

    results = []

    if success_get:
        for order in orders:
            time_planned = datetime.utcfromtimestamp(order.rp_time_planned).strftime('%d%m%y')
            # check if other orders for this date
            if time_planned in max_external_number_by_day:
                print(f"{time_planned} / {max_external_number_by_day[time_planned]} already exist")
                # number for order
                next_number_order = max_external_number_by_day[time_planned] + 1
                # name of contract_external_id
                contract_external_id = time_planned + f"/{next_number_order}"
                print(f"new number -> {contract_external_id}")
            else:
                print(f"{time_planned} -> free")
                next_number_order = 1
                contract_external_id = time_planned + f"/{next_number_order}"
                print(f"new number -> {contract_external_id}")
            # add new number to dictionary to check next order
            max_external_number_by_day[time_planned] = next_number_order
            # Формируем payload для заказа. Приводим поля к нужному типу,
            # заполняем отсутствующие поля пустыми строками или значениями по умолчанию.
            payload = {
                "contract_external_id": contract_external_id,
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
                "problem_description": order.rp_problem_description or None,
            }
            # URL для отправки заказа
            url = "https://online.auto-gps.eu/cnt/apiItinerary/serviceOrder"
            print(f"Sending order {order.pk} with payload: {payload}")
            response = api_client.call_api(url, http_method="POST", params=payload)
            print(response)
            if response and "id" in response:
                order.active = True
                order.rp_id = response["id"]
                order.rp_contract_external_id = contract_external_id
                order.contract_external_id_for_admin = contract_external_id
                order.save(update_fields=["active", "rp_id", "rp_contract_external_id", "contract_external_id_for_admin"])
                results.append(f"Order {order.pk} sent successfully with external id {response['id']}.")
            else:
                results.append(f"Failed to send order {order.pk}.")
    else:
        print(f"Failed to get orders fro route plane")
    print(f"created {len(results)} orders. Orders: {results}")
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
    time_threshold = timezone.now() - timedelta(minutes=1)
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
            'monday': order.monday,
            'tuesday': order.tuesday,
            'wednesday': order.wednesday,
            'thursday': order.thursday,
            'friday': order.friday,
            'rp_client_external_id': order.rp_client_external_id,
            'rp_place_external_id': order.rp_place_external_id,
            'rp_place_title': order.rp_place_title,
            'rp_place_city': order.rp_place_city,
            'rp_place_street': order.rp_place_street,
            'rp_place_number': order.rp_place_number,
            'rp_place_zip': order.rp_place_zip,
            'rp_place_email': order.rp_place_email,
            'rp_place_person': order.rp_place_person,
            'rp_place_phone': order.rp_place_phone,
            'rp_contract_title': order.rp_contract_title,
            'rp_branch_office_id': 2263168,
            'rp_status': 0,
            'every_week': order.every_week,
            'processed': True,
        }
        # заполняем отсутствующие поля пустыми строками или значениями по умолчанию.
        if order.type_ship == 'pickup_ship_one' or order.type_ship == 'pickup_ship_dif':
            order_date = int(datetime.combine(order.date_start_day, time()).timestamp())
            order.rp_time_realization = order_date # date when courier to come
            days_list = [] # days when courier has to come
            if order.system == 'Own':
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
                days_list = [1,3]
            elif order.system == 'Every_day':
                days_list = [0,1,2,3,4]
            new_order_dates = get_dates_by_weekdays(order.date_start_day, days_list)
            new_order_pk = 0
            for idx, date in enumerate(new_order_dates):
                if idx == 0:
                    group_pair_id = order.group_pair_id # id of main order
                else:
                    group_pair_id = new_order_pk # id of previous order
                if idx % 2 == 0: # even = delivery, odd = pickup
                    base_order_data.update({
                        'rp_time_planned': int(datetime.combine(date, time()).timestamp()),  # заменим позже, если нужно
                        'date_start_day': date,  # для нового заказа
                        'rp_problem_description': "delivery",
                        'date_pickup': order.date_start_day,  # дата предыдущего заказа
                        'date_delivery': date,             # текущая дата
                        'delivery': True,
                        'pickup': False,
                        'group_pair_id': group_pair_id,
                    })
                else:
                    base_order_data.update({
                        'rp_time_planned': int(datetime.combine(date, time()).timestamp()),
                        'date_start_day': date,  # для нового заказа
                        'rp_problem_description': "pickup",
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
                'rp_problem_description': "delivery",
            })
            new_order = Order(**base_order_data)
            new_order.save()
            print("success")
        order.processed = True
        order.save(update_fields=["processed"])
    return results


@shared_task
def update_orders_task():
    """
    Update status order
    """
    api_key = settings.EXTERNAL_API_KEY
    api_client = RestApiClient(api_key)
    url = "https://online.auto-gps.eu/cnt/apiItinerary/contractList"
    params = {
        "show_closed": 0,
        "last_status_change": 86400,
        "limit": 300,
        "offset": 0,
    }
    orders_data_from_rp = [] # list for data from route plane
    success_get = False # for ensure if request is success
    try:
        response = api_client.call_api(url, http_method="GET", params=params)
        orders_data_from_rp = response
        success_get = True
    except requests.exceptions.RequestException as e:
        print("API Request failed:", e)

    if success_get: # request is success
        if orders_data_from_rp: # list with data is not empty
            close_old_connections()
            from order.models import Order
            result = []
            for item in orders_data_from_rp:
                external_id = item["external_id"]
                try:
                    order = Order.objects.get(rp_contract_external_id=external_id)
                    order.rp_problem_description = item["problem_description"]
                    order.rp_time_realization = item["time_realization"]
                    order.rp_status = item["status"]
                    order.save(update_fields=["rp_problem_description", "rp_status", "rp_time_realization"])

                except:
                    print(f"Order {external_id} not found.")
                    return f"Order {external_id} not found."

            return result

        else:
            return "order_data_from_rp is empty"
    else:
        return "Request doesn't work"


@shared_task
def check_file_in_orders_task():
    """
    Check if file exists in order
    """
    now = datetime.now()
    # 30 дней назад
    past_period = now - timedelta(days=30)
    # Два дня вперед
    two_days_ahead = now + timedelta(days=2)
    # Перевод в Unix timestamp (целое число секунд с 1 января 1970 года)
    timestamp_past_period = int(past_period.timestamp())
    timestamp_two_days_ahead = int(two_days_ahead.timestamp())

    api_key = settings.EXTERNAL_API_KEY
    api_client = RestApiClient(api_key)
    url = "https://online.auto-gps.eu/cnt/apiItinerary/documentList"
    params = {
        "dateTimeFrom": timestamp_past_period,
        "dateTimeTo": timestamp_two_days_ahead,
    }
    data_from_rp = [] # list for data from route plane
    try:
        response = api_client.call_api(url, http_method="GET", params=params)
        data_from_rp = response
    except requests.exceptions.RequestException as e:
        print("API Request failed:", e)

    # Если данных нет, возвращаем соответствующее сообщение
    if not data_from_rp:
        return "order_data_from_rp is empty"

    close_old_connections()
    from order.models import Order, PhotoReport
    result = []
    for item in data_from_rp[0]:
        external_id = item.get("contractId")
        item_id = item.get("id")
        # Допустим, ещё есть поля name, mime и т.д.
        name = item.get("name")
        mime = item.get("mime")

        if not external_id or not item_id:
            # Если у нас нет contractId или id, то пропускаем
            continue

        try:
            order = Order.objects.get(rp_contract_external_id=external_id)
        except Order.DoesNotExist:
            print(f"Order с rp_contract_external_id={external_id} не найден.")
            continue

        # Проверяем, есть ли уже такой file_id
        if not PhotoReport.objects.filter(file_id=item_id).exists():
            # Если не существует, то создаём
            PhotoReport.objects.create(
                order=order,
                file_id=item_id,
                name=name,
                mime=mime,
            )
            print(f"PhotoReport создан: file_id={item_id}")
            result.append(item_id)
        else:
            print(f"PhotoReport уже существует: file_id={item_id}")

    return result


@shared_task
def download_file_from_external_api(file_id):
    """
    Запрашивает файл с внешнего API и сохраняет его в базе данных.
    """
    url = "https://online.auto-gps.eu/cnt/apiItinerary/document"
    api_key = settings.EXTERNAL_API_KEY
    api_client = RestApiClient(api_key)
    params = {
        "id": file_id,
    }
    try:
        from order.models import PhotoReport
        response = api_client.call_api(url, http_method="GET", params=params)
        response.raise_for_status()

        # Создание объекта PhotoReport
        photo_report = PhotoReport.objects.create(file_id=file_id)
        photo_report.file.save(f"{file_id}.jpg", ContentFile(response.content), save=True)

        return f"File {file_id} downloaded successfully."

    except requests.exceptions.RequestException as e:
        return f"Failed to download file {file_id}: {str(e)}"
