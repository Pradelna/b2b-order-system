from django.db import models
from customer.models import Customer


class Place(models.Model):
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
