from django.db import models
from customer.models import Customer
from integration.tasks import create_place_task, update_place_task, send_email_deleted_place_task


class Place(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="customer_place")
    place_name = models.CharField("Place name", max_length=250)
    active = models.BooleanField("Active", default=True)
    data_sent = models.BooleanField("Data sent", default=False)
    deleted = models.BooleanField("Deleted", default=False)
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

    def save(self, *args, **kwargs):
        is_new = not self.pk
        if is_new:
            # Сохраняем новый объект с active=False (по умолчанию не отправлено)
            super().save(*args, **kwargs)
            if not self.rp_client_external_id:
                self.rp_client_external_id = self.customer.rp_client_external_id
                self.rp_client_name = self.customer.company_name
                self.rp_client_id = self.customer.rp_client_id
                self.rp_title = self.place_name
                self.rp_external_id = f"ZS {self.rp_title}"
            super().save(update_fields=[
                'rp_client_external_id',
                'rp_client_name',
                'rp_title',
                'rp_external_id',
                'rp_client_id'
            ])
            # Если объект новый, его active уже False (не отправлено)
            # Можно выйти, чтобы избежать повторного сохранения сразу после создания
            return

        # Если объект существует, но еще не отправлен (data_sent == False)
        # и при этом клиент активен, запускаем задачу отправки
        # if self.customer.active and not self.data_sent:
        #     super().save(*args, **kwargs)  # Сохраняем изменения
        #     # from integration.tasks import create_place_task
        #     create_place_task.delay(self.pk)
        #     super().save(update_fields=['active'])
        #     return
        if self.rp_id:
            update_place_task.delay(place_id=self.pk)
        if self.deleted:
            super().save(*args, **kwargs)
            send_email_deleted_place_task.delay(
                place_id=self.pk,
                place_name=self.place_name,
                place_external_id=self.rp_external_id,
                customer=self.customer.company_name,
            )
            return
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Place of {self.customer.company_name} - {self.place_name}"

    class Meta:
        verbose_name = 'Place'
        verbose_name_plural = 'Places'
