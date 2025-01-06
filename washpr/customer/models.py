from django.contrib.auth import get_user_model
from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
import os


User = get_user_model()


def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT / user_<id>/<filename>
    return 'user_{0}/{1}'.format(instance.author.username, filename)


class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="customer")
    company_name = models.CharField("Company name", max_length=200, null=True, blank=True)
    company_address = models.CharField("Company address", max_length=200, null=True, blank=True)
    company_ico = models.CharField("Company ico", max_length=20, null=True, blank=True)
    phone_regex = RegexValidator(
        regex=r'^\+?(\d){6,18}$',
        message="Phone number must be entered in the format: '+431234567890' or 01234567890"
    )
    company_phone = models.CharField("Company phone", null=True, blank=True, validators=[phone_regex], max_length=17)
    company_email = models.CharField("Company email", max_length=100, null=True, blank=True)
    company_person = models.CharField("Company person", max_length=100, null=True, blank=True)

    def __str__(self):
        return self.company_name

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


class CustomerDocuments(models.Model):
    """ Модель документов клиента. """
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(
        upload_to=customer_document_upload_path,
        validators=[validate_file_size, validate_file_extension]
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document for {self.customer.user.username} - {self.file.name}"
