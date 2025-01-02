from django.contrib.auth import get_user_model
from django.db import models
from django.core.validators import RegexValidator


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
