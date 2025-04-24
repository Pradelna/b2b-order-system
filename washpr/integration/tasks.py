import json
from collections import defaultdict
from datetime import datetime, time, timedelta, date
import time as ptime

from dateutil.relativedelta import relativedelta
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

import logging

logger = logging.getLogger(__name__)

COMPLETED_STATUSES = {4, 5, 11}


@shared_task(
    autoretry_for=(requests.exceptions.RequestException,),
    retry_kwargs={"max_retries": 5, "countdown": 180}
)
def send_contact_email_task(subject, message, from_email, recipient_list):
    print(
        f"✅Sending contact email: subject - {subject, message}, message - {message}, from - {from_email}",
        recipient_list
    )
    send_mail(subject, message, from_email, recipient_list)
    return "Sending contact email"


# Class for working with external API Route Plan
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
            print("✅ Client was created successfully: ", response)
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
        # print("Place params: ", params)
        response = self.call_api(url, http_method="POST", params=params)
        if response:
            # print("Place created successfully:", response)
            print(f"✅ Place {place_title} created successfully for client {client_external_id}")
            return f"✅ Place {place_title} created successfully for client {client_external_id}"
        else:
            print(f"❌ Failed to create place {place_title}")
            return f"❌ Failed to create place {place_title}"


@shared_task(
    autoretry_for=(requests.exceptions.RequestException,),
    retry_kwargs={"max_retries": 5, "countdown": 180}
)
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

    client_external_id = customer.rp_client_external_id or customer.company_name
    client_name = customer.company_name

    response = api_client.create_client(client_external_id, client_name)
    # print(f"Create client response: {response}")

    if response and "id" in response:
        client_id = response["id"]
        customer.rp_client_id = client_id
        customer.data_sent = True
        customer.save(update_fields=[
            "rp_client_id",
            "data_sent",
        ])

        create_all_place_task.delay(customer_id)

        if customer.user.lang == 'cz':
            subject = "Váš účet byl schválen"
            message = (
                f"Dobrý den, {customer.company_person or customer.company_name}!\n\n"
                f"Váš účet byl úspěšně schválen.\n"
                f"Ceník za služby prádelny naleznete ve Vašem uživatelském rozhraní.\n"
                f"Můžete začít objednávat!\n"
                f"Těšíme se na spolupráci!\n\n"
                f"S pozdravem\n"
                f"Tým Prádelna no.1\n"
            )
        elif customer.user.lang == 'ru':
            subject = "Ваш аккаунт активирован"
            message = (
                f"Здравствуйте, {customer.company_person or customer.company_name}!\n\n"
                f"Ваша учетная запись была успешно одобрена.\n"
                f"Тарифы на прачечные услуги вы можете найти в вашем пользовательском интерфейсе.\n"
                f"Вы можете начать заказывать!\n"
                f"Мы с нетерпением ждем сотрудничества с вами!\n\n"
                f"С уважением\n"
                f"Команда Prádelna no.1\n"
            )
        else:
            subject = "Your account has been activated"
            message = (
                f"Hello, {customer.company_person or customer.company_name}!\n\n"
                f"Your account has been successfully approved.\n"
                f"You can find the laundry service rates in your user interface.\n"
                f"You can start ordering!\n"
                f"We look forward to working with you!\n\n"
                f"Best regards\n"
                f"The Prádelna no.1 team\n"
            )

        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [customer.user.email]
        send_mail(subject, message, from_email, recipient_list)
        print(f"✅ create_client_task Client created and Confirmation email sent to {customer.user.email}")
        return f"✅ Client created and email sent for customer {customer.company_name} with external client id {customer.rp_client_external_id}."
    else:
        print(f"❌ Failed to create client - {customer.company_name}")
        return f"❌ Failed to create client for customer {customer.company_name}."


@shared_task(
    autoretry_for=(requests.exceptions.RequestException,),
    retry_kwargs={"max_retries": 5, "countdown": 180}
)
def create_place_task(place_id):
    """
    The task of sending location data to an external system. After a successful response (presence of the "id" field),
    updates the Place model, saving the remote_id.
    """
    close_old_connections()
    from place.models import Place  # Предполагается, что модель Place в приложении place
    try:
        place = Place.objects.get(pk=place_id)
    except Place.DoesNotExist:
        print(f"❌ create_place_task Place with id {place_id} not found.")
        return f"❌ Place with id {place_id} not found."

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
        # print(f"Create place response: {response}")
        if response and "id" in response:
            place.rp_id = response["id"]
            place.data_sent = True
            place.save(update_fields=["rp_id", "data_sent"])
            print(f"✅ create_place_task Place {place_id} created with remote id {response['id']}.")
            return f"✅ Place {place_id} created with remote id {response['id']}."
        else:
            print(f"❌ Failed to create place {place_id}.")
            return f"❌ Failed to create place {place_id}."

    else:
        return f"Customer is not active yet"


@shared_task(
    autoretry_for=(requests.exceptions.RequestException,),
    retry_kwargs={"max_retries": 5, "countdown": 180}
)
def create_all_place_task(customer_id):
    """
    The task of sending data for all locations to an external system.
    After a successful response, it updates the Place model, saving the remote_id.
    """
    close_old_connections()
    from place.models import Place  # Предполагается, что модель Place в приложении place
    try:
        places = Place.objects.filter(customer=customer_id, data_sent=False)
    except Place.DoesNotExist:
        return f"Place with active=Flase not found."

    api_key = settings.EXTERNAL_API_KEY
    api_client = RestApiClient(api_key)

    result = []
    fail_result = []

    if len(places) != 0:
        for place in places:
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
            # print(f"Create place response: {response}")
            if response and "id" in response:
                place.rp_id = response["id"]
                place.data_sent = True
                place.save(update_fields=["rp_id", "data_sent"])
                print(f"✅ create_all_place_task Place {place.place_name} created with remote id {response['id']}.")
                result.append(f"{place.place_name}")
            else:
                print(f"❌ create_all_place_task Failed to create place {place.place_name}.")
                fail_result.append(f"{place.place_name}.")

    print(f"✅ create_all_place_task Places created: {result}, Places don't created: {fail_result}")
    return f"✅ Places created: {result}, Places don't created: {fail_result}"


@shared_task(
    autoretry_for=(requests.exceptions.RequestException,),
    retry_kwargs={"max_retries": 5, "countdown": 180}
)
def update_place_task(place_id):
    """
    Updates the data of an existing Place (which has already been created in an external system).
    For this, the Place must have place.rp_id filled in.
    """
    close_old_connections()
    from place.models import Place  # Модель Place

    try:
        place = Place.objects.get(pk=place_id)
    except Place.DoesNotExist:
        print(f"\033[91m ❌ update_place_task Place with id {place_id} not found.\033[0m")
        return f"❌ Place with id {place_id} not found."

    # Проверяем, что у place есть внешний идентификатор (rp_id),
    # иначе нечего обновлять (или сначала нужно вызвать create_place_task).
    if not place.rp_id:
        return f"update_place_task Place {place_id} does not have rp_id. Nothing to update."

    # Инициализируем API-клиент
    from django.conf import settings
    api_key = settings.EXTERNAL_API_KEY
    api_client = RestApiClient(api_key)

    # Допустим, часть полей берём из place, часть — жёстко
    response = api_client.create_client_place(
        client_external_id=place.rp_client_external_id,
        place_external_id=place.rp_external_id,
        place_title=place.place_name,
        place_country="CZ",
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

    if response and "id" in response:
        # Если во внешней системе возвращается тот же id или обновлённые данные, можно их сохранить
        print(f"✅ update_place_task Place {place_id} updated with remote id {response['id']}.")
        return f"✅ Place {place_id} updated with remote id {response['id']}."
    else:
        print(f"❌ update_place_task Failed to update place {place_id}.")
        return f"❌ Failed to update place {place_id}."


@shared_task(
    autoretry_for=(requests.exceptions.RequestException,),
    retry_kwargs={"max_retries": 5, "countdown": 180}
)
def send_orders_task():
    """
    The task runs every hour and selects orders that:
      - Have not yet been sent (reported=False)
      - Were created more than 35 minutes ago
      For each order, a request is sent to https://online.auto-gps.eu/cnt/apiItinerary/contractAdd.
    Upon a successful response (presence of the "id" field in the response), the order is marked as sent (reported=True).
    """

    api_key = settings.EXTERNAL_API_KEY
    api_client = RestApiClient(api_key)

    close_old_connections()
    from order.models import Order  # Импортируем модель заказа из приложения order

    # Выбираем заказы, не отправленные ранее и созданные более 35 минут назад
    # time_threshold = timezone.now() - timedelta(minutes=35)
    orders = Order.objects.filter(active=False, canceled=False, processed=True)

    results = []
    fail_results = []

    for order in orders:
        time_planned = datetime.utcfromtimestamp(order.rp_time_planned).strftime('%d%m%y')

        contract_external_id = time_planned + f"/{order.id}ZS"
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
        # print(f"Sending order {order.pk} with payload: {payload}")
        response = api_client.call_api(url, http_method="POST", params=payload)
        # print(response)
        if response and "id" in response:
            order.active = True
            order.rp_id = response["id"]
            order.rp_contract_external_id = contract_external_id
            order.contract_external_id_for_admin = contract_external_id
            order.save(update_fields=["active", "rp_id", "rp_contract_external_id", "contract_external_id_for_admin"])
            print(f"✅ send_orders_task Order {order.pk} sent successfully with external id {response['id']}")
            results.append(f"{order.pk}, external id - {response['id']}.")
        else:
            fail_results.append(f"\033[91m❌ Failed to send order {order.pk}.\033[0m")

    print(f"✅ send_orders_task Sent {len(results)} orders. Orders: {results}. Failed {len(fail_results)} orders")
    return f"✅ Sent {len(results)} orders. Orders: {results}. Failed {len(fail_results)} orders"


@shared_task(
    autoretry_for=(requests.exceptions.RequestException,),
    retry_kwargs={"max_retries": 5, "countdown": 180}
)
def create_orders_task():
    """
    Задача запускается каждый час и создает автоматически заказы на месяц или второй для одноразовых:
      - Созданы более 35 минут назад
    """
    close_old_connections()
    from order.models import Order  # Импортируем модель заказа из приложения order

    # Выбираем заказы, не отправленные ранее и созданные более 35 минут назад
    time_threshold = timezone.now() - timedelta(minutes=35)
    orders = Order.objects.filter(
        processed=False,
        canceled=False,
        main_order=True,
        created_at__lte=time_threshold,
        place__deleted=False,
    )

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
        # create date for others orders
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
                if order.friday:
                    days_list.append(5)
                if order.friday:
                    days_list.append(6)
            elif order.system == 'Mon_Wed_Fri':
                days_list = [0,2,4]
            elif order.system == 'Tue_Thu':
                days_list = [1,3]
            elif order.system == 'Every_day':
                days_list = [0,1,2,3,4]
            elif order.system == 'Every_day_with_weekend':
                days_list = [0,1,2,3,4,5,6]
            new_order_dates = get_dates_by_weekdays(order.date_start_day, days_list)
            # check if new_order_dates is even if pickup_ship_dif
            if order.type_ship == 'pickup_ship_dif':
                if len(new_order_dates) % 2 == 0:
                    last_date = new_order_dates[-1]

                    # Попробуем сначала добавить через get_dates_by_weekdays
                    extra_dates = get_dates_by_weekdays(last_date + timedelta(days=1), days_list)
                    if extra_dates:
                        new_order_dates.append(extra_dates[0])

                    # Если всё ещё чётное количество, добавим вручную по системе
                    if len(new_order_dates) % 2 == 0:
                        last_date = new_order_dates[-1]
                        next_date = None

                        if order.system == 'Every_day':
                            next_date = last_date + timedelta(days=1)
                            if next_date.weekday() == 5:
                                next_date += timedelta(days=2)
                            elif next_date.weekday() == 6:
                                next_date += timedelta(days=1)

                        elif order.system == 'Every_day_with_weekend':
                            next_date = last_date + timedelta(days=1)

                        elif order.system == 'Mon_Wed_Fri':
                            for offset in range(1, 8):
                                potential = last_date + timedelta(days=offset)
                                if potential.weekday() in [0, 2, 4]:
                                    next_date = potential
                                    break

                        elif order.system == 'Tue_Thu':
                            for offset in range(1, 8):
                                potential = last_date + timedelta(days=offset)
                                if potential.weekday() in [1, 3]:
                                    next_date = potential
                                    break

                        elif order.system == 'Own':
                            for offset in range(1, 8):
                                potential = last_date + timedelta(days=offset)
                                if potential.weekday() in days_list:
                                    next_date = potential
                                    break

                        if next_date:
                            new_order_dates.append(next_date)

                    # Финальная проверка
                    if len(new_order_dates) % 2 == 0:
                        print(f"❌ The date is not added properly. Final length: {len(new_order_dates)}")
                    else:
                        print(f"✅ A new date has been added. Final length: {len(new_order_dates)}")

            new_order_pk = 0
            for idx, date in enumerate(new_order_dates):
                rp_time_planned = int(datetime.combine(date, time()).timestamp()) + 43200
                if idx == 0:
                    group_pair_id = order.group_pair_id # id of main order
                else:
                    group_pair_id = new_order_pk # id of previous order
                if idx % 2 == 0: # even = delivery, odd = pickup
                    base_order_data.update({
                        'rp_time_planned': rp_time_planned,
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
                        'rp_time_planned': rp_time_planned,
                        'date_start_day': date,  # для нового заказа
                        'rp_problem_description': "pickup",
                        'date_pickup': date,  # текущая дата
                        'pickup': True,
                        'delivery': False,
                    })
                if order.type_ship == 'pickup_ship_one':
                    base_order_data.update({
                        'rp_problem_description': "Výměna čistého prádla za špinavé",
                    })
                new_order = Order(**base_order_data)
                new_order.save()
                print(f"✅ create_orders_task success create EVERY WEEK {new_order.pk}")
                new_order_pk = new_order.pk
                results.append(new_order.pk)

        elif order.type_ship == 'one_time' or order.type_ship == 'quick_order':
            pl_date = order.date_delivery
            logger.info(f"Logger date delivery: {pl_date}. And date planned: {int(datetime.combine(pl_date, time()).timestamp())}")
            # print(f"Print date delivery: {pl_date}. And date planned: {int(datetime.combine(pl_date, time()).timestamp())}")
            rp_time_planned = int(datetime.combine(pl_date, time()).timestamp()) + 43200
            # print(f"Print rp planned: {rp_time_planned}")
            base_order_data.update({
                'rp_time_planned': rp_time_planned,
                'date_start_day': order.date_pickup,
                'date_pickup': order.date_pickup,
                'date_delivery': pl_date,
                'delivery': True,
                'pickup': False,
                'group_pair_id': order.group_pair_id,
                'rp_problem_description': "delivery",
            })
            logger.info("Logger base order data", base_order_data)
            new_order = Order(**base_order_data)
            new_order.save()
            results.append(new_order.pk)
            print(f"✅ create_orders_task success create ONE TIME ORDER {new_order.pk}, rp planned - {new_order.rp_time_planned}")
        order.processed = True
        order.rp_status = 0
        order.save(update_fields=["processed", "rp_status"])

    print(f"✅ create_orders_task Orders was created successfully: {results}")
    return f"✅ Orders was created successfully: {results}"


@shared_task(
    autoretry_for=(requests.exceptions.RequestException,),
    retry_kwargs={"max_retries": 5, "countdown": 180}
)
def update_orders_task():
    """
    Update status order
    """
    api_key = settings.EXTERNAL_API_KEY
    api_client = RestApiClient(api_key)
    url = "https://online.auto-gps.eu/cnt/apiItinerary/contractList"
    params = {
        "show_closed": 0,
        "last_status_change": 2600000,
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
        print("\033[91m❌ update_orders_task API Request failed: \033[0m", e)

    if success_get: # request is success
        if orders_data_from_rp: # list with data is not empty
            close_old_connections()
            from order.models import Order
            success =[]
            not_success = []
            for item in orders_data_from_rp:
                external_id = item["external_id"]
                # for main order and pick up order
                main_order = None
                try:
                    order = Order.objects.get(rp_contract_external_id=external_id)
                    # if order is pickup
                    if order.id == order.group_pair_id:
                        # logger.info(f"main external_id: {external_id}")
                        order.rp_problem_description = item["problem_description"]
                        order.rp_time_realization = item["time_realization"]
                        order.rp_status = item["status"]
                        order.save(update_fields=["rp_problem_description", "rp_status", "rp_time_realization"])
                        success.append(f"order No {order.pk} with {external_id}")
                        print(f"✅ Updated order No {order.pk} with {external_id}")
                        main_order = order
                    else:
                        try:
                            # if order is delivery
                            pickup_order = Order.objects.get(id=order.group_pair_id, pickup=True)
                            # print(f"pickup order {pickup_order.id} AND order delivery {order.id}")
                            # print(f"STATUS pickup order: {pickup_order.rp_status}")
                            # if pickup order is done or cancel
                            if pickup_order.rp_status in COMPLETED_STATUSES:
                                order.rp_problem_description = item["problem_description"]
                                order.rp_time_realization = item["time_realization"]
                                order.rp_status = item["status"]
                                order.save(update_fields=["rp_problem_description", "rp_status", "rp_time_realization"])
                                success.append(f"order No {order.pk} with {external_id}")
                                print(f"✅ Updated order No {order.pk} with {external_id}")
                        except Order.DoesNotExist:
                            print(f"\033[91m❌ update_orders_task order not found for {external_id}.\033[0m")
                            not_success.append(f"❌ update_orders_task order not found for {external_id}")
                            continue
                        except Exception as e:
                            print(f"\033[91m❌ update_orders_task order error for {external_id}.\033[0m")
                            not_success.append(f"order error for {external_id}: {str(e)}")
                            continue
                except Order.DoesNotExist:
                    print(f"\033[91m❌ update_orders_task order not found for {external_id}.\033[0m")
                    not_success.append(f"order not found for {external_id}")
                    continue
                except Exception as e:
                    print(f"\033[91m❌ update_orders_task order error for {external_id}.\033[0m")
                    not_success.append(f"order error for {external_id}: {str(e)}")
                    continue
                # there is only second delivery order in order history and needs to show status if it's main order
                if main_order and item["status"] not in COMPLETED_STATUSES: # if order is done don't change second order
                    try:
                        delivery_order = Order.objects.get(group_pair_id=main_order.group_pair_id, delivery=True)
                        delivery_order.rp_problem_description = item["problem_description"]
                        delivery_order.rp_time_realization = item["time_realization"]
                        delivery_order.rp_status = item["status"]
                        delivery_order.save(update_fields=["rp_problem_description", "rp_status", "rp_time_realization"])
                        print(f"✅ update_orders_task order No {delivery_order.pk} with {external_id} was updated")
                        success.append(f"order No {delivery_order.pk} with {external_id}")
                    except Order.DoesNotExist:
                        not_success.append(f"order not found for group {main_order.group_pair_id}")
                    except Exception as e:
                        not_success.append(f"order error for {external_id}: {str(e)}")

            print(f"✅ update_orders_task Success {len(success)} orders, fail {len(not_success)} orders")
            return {"✅ update_orders_task success": success, "not_success": not_success}

        else:
            print(f"\033[91m❌update_orders_task order_data_from_rp is empty\033[0m")
            return "order_data_from_rp is empty"
    else:
        print("\033[91m❌update_orders_task Request doesn't work\033[0m")
        return "Request doesn't work"


@shared_task(
    autoretry_for=(requests.exceptions.RequestException,),
    retry_kwargs={"max_retries": 5, "countdown": 180}
)
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
        print("\033[91m❌ check_file_in_orders_task API Request failed:\033[0m", e)

    # Если данных нет, возвращаем соответствующее сообщение
    if not data_from_rp:
        return "order_data_from_rp is empty"

    close_old_connections()
    from order.models import Order, PhotoReport
    result = []
    for item in data_from_rp[0]:
        external_id = item.get("contractId")
        item_id = item.get("id")
        name = item.get("name")
        mime = item.get("mime")

        if not external_id or not item_id:
            # Если у нас нет contractId или id, то пропускаем
            continue

        try:
            order = Order.objects.get(rp_contract_external_id=external_id)
        except Order.DoesNotExist:
            # print(f"Order с rp_contract_external_id={external_id} не найден.")
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
            print(f"✅ PhotoReport was created: file_id={item_id}")
            result.append(item_id)
        else:
            pass

    print(f"Files update done. Results: {result}")
    return result


@shared_task(
    autoretry_for=(requests.exceptions.RequestException,),
    retry_kwargs={"max_retries": 5, "countdown": 180}
)
def download_file_from_external_api(file_id):
    """
    Requests a file from an external API and saves it in the database.
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

        print(f"✅ File {file_id} downloaded successfully.")
        return f"✅ File {file_id} downloaded successfully."

    except requests.exceptions.RequestException as e:
        print(f"\033[91m❌ Failed to download file {file_id}: {str(e)}.\033[0m")
        return f"❌ Failed to download file {file_id}: {str(e)}"


@shared_task(
    autoretry_for=(requests.exceptions.RequestException,),
    retry_kwargs={"max_retries": 5, "countdown": 180}
)
def generate_order_report(user, year, month):
    """
    Creates (or updates) an OrderReport entry for the specified year/month for the given user.
    Returns the created (or updated) OrderReport.
    """
    # Начало месяца (первое число в нужном часовом поясе)
    start_of_month_dt = datetime(year, month, 1, tzinfo=timezone.get_current_timezone())
    # Конец месяца (последняя секунда)
    end_of_month_dt = (start_of_month_dt + relativedelta(months=1)) - timezone.timedelta(seconds=1)

    # print("start_of_month_dt:", start_of_month_dt)
    # print("end_of_month_dt:", end_of_month_dt )
    start_of_month = int(start_of_month_dt.timestamp())
    end_of_month = int(end_of_month_dt.timestamp())

    from order.models import Order, OrderReport

    # Заказы пользователя за период
    user_orders_in_month = Order.objects.filter(
        user=user.user,
        rp_time_planned__range=(start_of_month, end_of_month)
    )
    print(f"User: {user.user}")
    # print(f"user_orders_in_month={user_orders_in_month}")
    orders = Order.objects.filter(user=user.user)
    for order in orders:
        print(f"Time: {order.rp_time_planned}. Start of: {start_of_month}. End of: {end_of_month}")

    # report_month условимся хранить как первое число соответствующего месяца
    report_date = date(year, month, 1)

    # Создаём или получаем
    report, created = OrderReport.objects.get_or_create(
        customer=user,
        report_month=report_date,
    )
    # Заполняем связи
    if user_orders_in_month.exists():
        # Заменяем все заказы на актуальный набор
        report.orders.set(user_orders_in_month)
    else:
        # Если заказов не было, при желании можно очистить или ничего не делать
        report.orders.clear()
    print(f"✅ Report was created {report}")
    return f"✅ Report was created {report}"


@shared_task(
    autoretry_for=(requests.exceptions.RequestException,),
    retry_kwargs={"max_retries": 5, "countdown": 180}
)
def generate_monthly_reports_task():
    """
    Created once a month.
    Forms an OrderReport for each active user
    for the previous calendar month.
    """
    # Допустим, вызываем задачу 1-го числа каждого месяца.
    # Тогда "предыдущий месяц" - это (текущий месяц - 1).
    now = timezone.now()
    previous_month_date = now - relativedelta(months=1)

    year = previous_month_date.year
    month = previous_month_date.month

    # year = now.year
    # next_month_date = now + relativedelta(months=1)
    # month = next_month_date.month

    # Выбираем всех активных пользователей
    from customer.models import Customer
    active_users= Customer.objects.filter(data_sent=True, active=True)

    for user in active_users:
        generate_order_report(user, year, month)

    print(f"✅ Monthly reports created for {active_users.count()} active users for {year}-{month}.")
    return f"✅ Monthly reports created for {active_users.count()} active users for {year}-{month}."


@shared_task(
    autoretry_for=(requests.exceptions.RequestException,),
    retry_kwargs={"max_retries": 5, "countdown": 180}
)
def send_email_deleted_place_task(place_id, place_name, place_external_id, customer):
    from order.models import Order
    orders = Order.objects.filter(
        place__id=place_id,
        processed=True
    ).exclude(
        status__in=[4, 5, 11]
    )
    if len(orders) != 0:
        subject = "Je zapotřebí účast administrátora"
        message = (
            f"Zakaznik {customer} smazal místo {place_name} s nedokončenými objednávkami\n\n"
            f"Extarnal id - {place_external_id}\n"
            f"Prosím, věnujte pozornost."
        )
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = ["sergei@pradelna1.com", "office@pradelna1.com"]
        send_mail(subject, message, from_email, recipient_list)
        print(f"✅Place delete {place_name} email is sent")
    print(f"✅ Place was deleted: {place_name}")
    return f"✅ Place was deleted: {place_name}. Place didn't have actual orders"


@shared_task(
    autoretry_for=(requests.exceptions.RequestException,),
    retry_kwargs={"max_retries": 5, "countdown": 180}
)
def send_email_change_customer_task(rp_client_external_id, company_name):
    subject = "Je zapotřebí účast administrátora"
    message = (
        f"Zakaznik {company_name} chce změnit údaje\n\n"
        f"Extarnal id - {rp_client_external_id}\n"
        f"Prosím, věnujte pozornost."
    )
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = ["sergei@pradelna1.com", "office@pradelna1.com"]
    try:
        send_mail(subject, message, from_email, recipient_list)
        print(f"✅ Email was sent: {company_name} wants change data")
    except:
        print(f"\033[91m❌ Error sending email: {company_name} changed data.\033[0m")
        return f"Error sending email: {company_name} changed data"
    return f"✅ Email sent: {company_name} changed data"


@shared_task(
    autoretry_for=(requests.exceptions.RequestException,),
    retry_kwargs={"max_retries": 5, "countdown": 180}
)
def send_new_customer_task(company_name):
    logger.info(f"Start send email for new customer")
    subject = "Nový zákazník"
    message = (
        f"Nový zákazník {company_name}\n\n"
        f"Prosím, věnujte pozornost."
    )
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = ["sergei@pradelna1.com", "office@pradelna1.com"]
    try:
        send_mail(subject, message, from_email, recipient_list)
        print(f"✅ Email successfully sent to admin for new customer: {company_name}")
    except:
        print(f"\033[91m❌ Failed to send new customer email for {company_name}.\033[0m")
        return f"Error sending email: new customer {company_name}"
    print(f"✅ Email sent to admin: new customer {company_name}")
    return f"✅ Email sent to admin: new customer - {company_name}"
