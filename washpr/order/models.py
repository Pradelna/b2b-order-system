import os
from datetime import datetime, time, timedelta
from django.contrib.auth import get_user_model
from django.db import models
from customer.models import Customer
from place.models import Place


User = get_user_model()

TOMMOROW = datetime.now() + timedelta(days=1)


def report_file_path(instance, filename):
    """
    path for upload files:
    invoices/{user_id}/YYYY-MM/{filename}
    """
    report_month_str = instance.report.report_month.strftime("%Y-%m")  # Пример: "2025-02"
    user_id = instance.report.customer.user.id  # Получаем ID пользователя

    return os.path.join("invoices", str(user_id), report_month_str, filename)


class Order(models.Model):
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="order_place")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders", db_index=True, null=True, blank=True)
    group_month_id = models.IntegerField("Group monthly order ID", db_index=True, null=True, blank=True)
    group_pair_id = models.IntegerField("Group pair order ID", db_index=True, null=True, blank=True)
    choice_type_ship = [
        ('pickup_ship_one', 'clear for durty'),
        ('pickup_ship_dif', '1 day clear, 3th day durty'),
        ('one_time', 'One time order'),
        ('quick_order', 'Quick order')
    ]
    type_ship = models.CharField("Type of shipping", max_length=250, null=True, blank=True, choices=choice_type_ship)
    choice_system = [
        ('Mon_Wed_Fri', 'Monday Wednesday Friday'),
        ('Tue_Thu', 'Tuesday Thursday'),
        ('Every_day', 'Every day'),
        ('Own', 'Own system')
    ]
    system = models.CharField("System days", max_length=100, null=True, blank=True, choices=choice_system)
    date_start_day = models.DateField("Start day", null=True, blank=True)
    monday = models.BooleanField("Monday", default=False)
    tuesday = models.BooleanField("tuesday", default=False)
    wednesday = models.BooleanField("wednesday", default=False)
    thursday = models.BooleanField("thursday", default=False)
    friday = models.BooleanField("friday", default=False)
    saturday = models.BooleanField("saturday", default=False)
    sunday = models.BooleanField("sunday", default=False)
    date_pickup = models.DateField("Pick up day", default=datetime.now)
    date_delivery = models.DateField("Delivery day", default=datetime.now)
    every_week = models.BooleanField("Every week", default=False)
    terms = models.BooleanField("Terms of use", default=False)
    rp_contract_external_id = models.CharField("contract_external_id", max_length=250, null=True, blank=True)
    contract_external_id_for_admin = models.CharField("contract_external_id to show in admin", max_length=250, null=True, blank=True)
    active = models.BooleanField("Active", default=False)
    rp_id = models.IntegerField("rp id", null=True, blank=True)
    rp_client_external_id = models.CharField("ItineraryClient external id", max_length=250, null=True, blank=True)
    rp_place_external_id = models.CharField("place_external_id", max_length=250, null=True, blank=True)
    rp_place_title = models.CharField("place_title", max_length=250, null=True, blank=True)
    rp_place_city = models.CharField("place_city", max_length=250, null=True, blank=True)
    rp_place_street = models.CharField("ItineraryPlace street", max_length=250)
    rp_place_number = models.CharField("ItineraryPlace number", max_length=50)
    rp_place_zip = models.IntegerField("ItineraryPlace zip")
    rp_place_email = models.CharField("ItineraryPlace email", max_length=250, null=True, blank=True)
    rp_place_person = models.CharField("ItineraryPlace contact person", max_length=250, null=True, blank=True)
    rp_place_phone = models.CharField("ItineraryPlace phone number", max_length=250, null=True, blank=True)
    rp_contract_title = models.CharField("contract_title", max_length=250, null=True, blank=True)
    rp_problem_description = models.CharField("problem_description", max_length=250, null=True, blank=True)
    rp_customer_note = models.CharField("customer_note", max_length=250, null=True, blank=True)
    rp_dispatcher_note = models.CharField("dispatcher_note", max_length=250, null=True, blank=True)
    rp_technician_note = models.CharField("technician_note", max_length=250, null=True, blank=True)
    rp_time_from = models.IntegerField("time_from", null=True, blank=True)
    rp_time_to = models.IntegerField("time_to", null=True, blank=True)
    rp_time_start = models.IntegerField("time_start", null=True, blank=True)
    rp_time_realization = models.IntegerField("time_realization", null=True, blank=True)
    rp_time_planned = models.IntegerField("Planned time_realization", null=True, blank=True)
    rp_salesman_id = models.IntegerField("salesman_id", null=True, blank=True)
    rp_salesman_code = models.IntegerField("salesman_code", null=True, blank=True)
    rp_salesman_email = models.IntegerField("salesman_email", null=True, blank=True)
    rp_assigned_user_id = models.IntegerField("assigned_user_id", null=True, blank=True)
    rp_branch_office_id = models.IntegerField("Branch office id", null=True, blank=True)
    rp_status = models.IntegerField("status", null=True, blank=True)
    end_order = models.BooleanField("End repeating order", default=False)
    canceled = models.BooleanField("Canceled mistaken order", default=False)
    reported = models.BooleanField("Already added to report", default=False)
    main_order = models.BooleanField("Main order", default=False)
    pickup = models.BooleanField("Pickup", default=False)
    delivery = models.BooleanField("Delivery", default=False)
    processed = models.BooleanField("Processed", default=False)
    created_at = models.DateTimeField("Created at", auto_now_add=True)

    def save(self, *args, **kwargs):
        is_new = not self.pk
        if is_new:
            # Сохраняем новый объект с active=False (по умолчанию не отправлено)
            # в views.py тоже есть заполняемые поля
            super().save(*args, **kwargs)
            if self.type_ship == 'pickup_ship_one' or self.type_ship == 'pickup_ship_dif':
                self.rp_time_planned = int(datetime.combine(self.date_start_day, time()).timestamp())
            if self.type_ship == 'one_time' or self.type_ship == 'quick_order':
                self.rp_time_planned = int(datetime.combine(self.date_pickup, time()).timestamp())
                if self.type_ship == 'one_time':
                    self.group_month_id = 1
                if self.type_ship == 'quick_order':
                    self.group_month_id = 2
            if not self.rp_client_external_id:
                self.rp_client_external_id = self.place.customer.rp_client_external_id
                self.rp_place_external_id = self.place.rp_external_id
                self.rp_place_title = self.place.place_name
                self.rp_place_city = self.place.rp_city
                self.rp_place_street = self.place.rp_street
                self.rp_place_number = self.place.rp_number
                self.rp_place_zip = self.place.rp_zip
                self.rp_place_email = self.place.rp_email
                self.rp_place_person = self.place.rp_person
                self.rp_place_phone = self.place.rp_phone
                self.rp_contract_title = self.place.customer.company_name
                self.rp_branch_office_id = 2263168
                self.rp_problem_description = self.rp_customer_note
                self.contract_external_id_for_admin = self.pk
            if self.terms:
                self.main_order = True
                self.group_month_id = self.pk
                self.group_pair_id = self.pk
                self.pickup = True
            else:
                if self.pickup == True and self.delivery == False:
                    self.group_pair_id = self.pk

            super().save(update_fields=[
                'rp_client_external_id',
                'rp_place_external_id',
                'rp_place_title',
                'rp_place_city',
                'rp_place_street',
                'rp_place_number',
                'rp_place_zip',
                'rp_place_email',
                'rp_place_person',
                'rp_place_phone',
                'rp_contract_title',
                'rp_time_planned',
                'main_order',
                'pickup',
                'group_month_id',
                'group_pair_id',
                'rp_branch_office_id',
                'rp_problem_description',
            ])
            return

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order of {self.place.customer.company_name} - {self.place.place_name} - #{self.id} - {self.contract_external_id_for_admin}"

    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        indexes = [
            models.Index(fields=["reported"]),  # Ускоряет поиск невключенных заказов
            models.Index(fields=["user", "created_at"])  # Оптимизация фильтрации по пользователю
        ]


class OrderReport(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="order_reports")
    report_month = models.DateField()
    orders = models.ManyToManyField("Order", related_name="reports")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report for {self.customer} - {self.report_month.strftime('%B %Y')}"

    class Meta:
        verbose_name = 'Order monthly report'
        verbose_name_plural = 'Order monthly reports'

class ReportFile(models.Model):
    report = models.ForeignKey(OrderReport, on_delete=models.CASCADE, related_name="files")
    file = models.FileField(upload_to=report_file_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice {self.file.name} for Report {self.report.id}"

    class Meta:
        verbose_name = 'Monthly invoice'
        verbose_name_plural = 'Monthly invoices'


class PhotoReport(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="photo_reports")
    file_id = models.IntegerField("File ID")
    name = models.CharField("File name", max_length=250, blank=True, null=True)
    mime = models.CharField("File mime", max_length=250, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"File {self.file_id} for order {self.order.rp_contract_external_id}"

    class Meta:
        verbose_name = 'Photo report'
        verbose_name_plural = 'Photo reports'
