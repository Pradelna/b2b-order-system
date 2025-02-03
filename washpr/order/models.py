from datetime import datetime

from django.db import models
from customer.models import Customer
from place.models import Place


class WrongPlace(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="order_customer_place")
    place_name = models.CharField("Place name", max_length=250)
    active = models.BooleanField("Active", default=True)
    rp_client_external_id = models.CharField("ItineraryClient external id", max_length=250, null=True, blank=True)
    rp_client_name = models.CharField("Customer name", max_length=250, null=True, blank=True)
    rp_client_id = models.IntegerField("ItineraryClient id", null=True, blank=True)
    rp_id = models.IntegerField("ItineraryPlace id", null=True, blank=True)
    rp_external_id = models.CharField("ItineraryPlace external id", max_length=250, null=True, blank=True)
    rp_title = models.CharField("ItineraryPlace title", max_length=250, null=True, blank=True)
    rp_city = models.CharField("ItineraryPlace city", max_length=250)
    rp_street = models.CharField("ItineraryPlace street", max_length=250)
    rp_number = models.CharField("ItineraryPlace number", max_length=50)
    rp_zip = models.IntegerField("ItineraryPlace zip")
    rp_person = models.CharField("ItineraryPlace contact person", max_length=250, null=True, blank=True)
    rp_phone = models.CharField("ItineraryPlace phone number", max_length=50, null=True, blank=True)
    rp_email = models.CharField("ItineraryPlace email", max_length=250, null=True, blank=True)

    def __str__(self):
        return f"Place of {self.customer.company_name} - {self.place_name}"

    class Meta:
        verbose_name = 'Worng Place'
        verbose_name_plural = 'Wrong Places'


class Order(models.Model):
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="order_place")
    choice_type_ship = [
        ('pickup_ship_one', 'clear for durty'),
        ('pickup_ship_dif', '1 day clear, 2 day durty')
    ]
    type_ship = models.CharField("Type of shipping", max_length=250, null=True, blank=True, choices=choice_type_ship)
    choice_system = [
        ('Mon_Wed_Fri', 'Monday Wednesday Friday'),
        ('Tue_Thu', 'Tuesday Thursday'),
        ('Every_day', 'Every day'),
        ('Own', 'Own system')
    ]
    system = models.CharField("System days", max_length=100, null=True, blank=True, choices=choice_system)
    monday = models.BooleanField("Monday", default=False)
    tuesday = models.BooleanField("tuesday", default=False)
    wednesday = models.BooleanField("wednesday", default=False)
    thursday = models.BooleanField("thursday", default=False)
    friday = models.BooleanField("friday", default=False)
    date_pickup = models.DateField("Pick up day", default=datetime.now)
    date_delivery = models.DateField("Delivery day", default=datetime.now)
    every_week = models.BooleanField("Every week", default=False)
    terms = models.BooleanField("Terms of use", default=False)
    rp_contract_external_id = models.CharField("contract_external_id", max_length=250, null=True, blank=True)
    active = models.BooleanField("Active", default=True)
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
    rp_status = models.IntegerField("technician_note", null=True, blank=True)
    rp_time_from = models.IntegerField("time_from", null=True, blank=True)
    rp_time_to = models.IntegerField("time_to", null=True, blank=True)
    rp_time_start = models.IntegerField("time_start", null=True, blank=True)
    rp_time_realization = models.IntegerField("time_realization", null=True, blank=True)
    rp_salesman_id = models.IntegerField("salesman_id", null=True, blank=True)
    rp_salesman_code = models.IntegerField("salesman_code", null=True, blank=True)
    rp_salesman_email = models.IntegerField("salesman_email", null=True, blank=True)
    rp_assigned_user_id = models.IntegerField("assigned_user_id", null=True, blank=True)
    rp_branch_office_id = models.IntegerField("salesman_email", null=True, blank=True)
    rp_status = models.IntegerField("status", null=True, blank=True)
    end_order = models.BooleanField("End repeating order", default=False)

    def __str__(self):
        return f"Order of {self.place.customer.company_name} - {self.place.place_name} - {self.id}"

    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
