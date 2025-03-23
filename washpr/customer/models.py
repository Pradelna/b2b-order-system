from django.contrib.auth import get_user_model
from django.db import models
from django.core.validators import RegexValidator
import os

from integration.tasks import create_client_task, send_email_change_customer_task, send_new_customer_task
from rest_framework.exceptions import ValidationError

User = get_user_model()


def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT / user_<id>/<filename>
    return 'user_{0}/{1}'.format(instance.author.email, filename)


class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="customer")
    company_name = models.CharField("Company name", max_length=200, null=True, blank=True)
    company_address = models.CharField("Company address", max_length=200, null=True, blank=True)
    company_ico = models.CharField("Company ICO", max_length=20, null=True, blank=True)
    company_dic = models.CharField("Company DIC", max_length=20, null=True, blank=True)
    new_company_name = models.CharField("NEW Company name", max_length=200, null=True, blank=True)
    new_company_address = models.CharField("NEW Company address", max_length=200, null=True, blank=True)
    new_company_ico = models.CharField("NEW Company ICO", max_length=20, null=True, blank=True)
    new_company_dic = models.CharField("NEW Company DIC", max_length=20, null=True, blank=True)
    phone_regex = RegexValidator(
        regex=r'^\+?(\d){6,18}$',
        message="Číslo telefonu musí být zadáno ve formátu: +420234567890 nebo 01234567890"
    )
    company_phone = models.CharField("Company phone", null=True, blank=True, validators=[phone_regex], max_length=17)
    company_email = models.CharField("Company email", max_length=100, null=True, blank=True)
    company_person = models.CharField("Company person", max_length=100, null=True, blank=True)
    vop = models.BooleanField("Všeobecné obchodní podmínk", default=False)
    terms_of_use = models.BooleanField("Pravidla", default=False)
    gdpr = models.BooleanField("GDPR", default=False)
    active = models.BooleanField("Active", default=False)
    weekend_able = models.BooleanField("Weekend able", default=False)
    rp_client_id = models.IntegerField("ItineraryClient id", null=True, blank=True)
    rp_client_external_id = models.CharField("ItineraryClient external id", max_length=250, null=True, blank=True)
    data_sent = models.BooleanField("Data sent", default=False)
    change_data = models.BooleanField("Change data", default=False)

    def save(self, *args, **kwargs):
        if not self.pk:
            # Если объект новый, сначала сохраняем его, чтобы получить pk
            super().save(*args, **kwargs)
            # Если поле rp_client_external_id ещё не заполнено, формируем его, используя pk
            if not self.rp_client_external_id:
                self.rp_client_external_id = "zakaznik_" + str(self.pk)
                self.company_name = self.new_company_name
                self.company_address = self.new_company_address
                self.company_ico = self.new_company_ico
                self.company_dic = self.new_company_dic
            # Обновляем запись с новым значением rp_client_external_id
            super().save(update_fields=[
                'rp_client_external_id',
                'company_name',
                'company_address',
                'company_ico',
                'company_dic',
            ])
            send_new_customer_task.delay(self.company_name)
            return
        else:
            # Если объект уже существует, но rp_client_external_id не заполнено, устанавливаем его
            if not self.rp_client_external_id:
                self.rp_client_external_id = "test" + str(self.pk)

        # Если клиент активен и данные ещё не отправлены, запускаем задачу
        if self.active and not self.data_sent:
            super().save(*args, **kwargs)
            create_client_task.delay(self.pk)
            return

        if self.change_data:
            super().save(*args, **kwargs)
            send_email_change_customer_task.delay(self.rp_client_external_id, self.company_name)
            return

        super().save(*args, **kwargs)

    def __str__(self):
        if self.change_data:
            return f"CHANGE DATA for NEW - {self.new_company_name}"
        else:
            return str(self.company_name or f"NEW - {self.new_company_name}" or self.id)

    class Meta:
        verbose_name = 'Company info'
        verbose_name_plural = 'Companies info'


def validate_file_size(value):
    """ Проверка размера файла (не более 2MB). """
    filesize = value.size
    if filesize > 2 * 1024 * 1024:  # 2 MB
        raise ValidationError('The maximum file size that can be uploaded is 2MB.')


def validate_file_extension(value):
    """ Проверка разрешенных расширений файлов. """
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
    if ext not in valid_extensions:
        raise ValidationError('Unsupported file extension. Allowed extensions: PDF, JPG, JPEG, PNG.')


def customer_document_upload_path(instance, filename):
    """ Генерация пути для сохранения файла: media/customer.<user_id>/ """
    return f'customers/{instance.customer.user.id}/{filename}'


def document_for_customer_upload_path(instance, filename):
    """ Генерация пути для сохранения файла: media/customer.<user_id>/ """
    return f'customers/{instance.customer.user.id}/for_customer/{filename}'


class CustomerDocuments(models.Model):
    """ Модель документов клиента. """
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(
        upload_to=customer_document_upload_path,
        validators=[validate_file_size, validate_file_extension]
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document for {self.customer.user.email} - {self.file.name}"


class DocumentsForCustomer(models.Model):
    """ Модель документов для клиента. """
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='documents_for_customer')
    file = models.FileField(
        upload_to=document_for_customer_upload_path,
        validators=[validate_file_size, validate_file_extension]
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document for {self.customer.user.email} - {self.file.name}"
