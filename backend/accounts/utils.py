import requests
from smtplib import SMTPRecipientsRefused
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth import get_user_model
from rest_framework.views import exception_handler
from rest_framework.response import Response
import ssl
from django.core.mail.backends.smtp import EmailBackend


def verify_recaptcha(token: str) -> bool:
    """
    Проверяет reCAPTCHA-токен через Google API.
    Возвращает True, если проверка пройдена, иначе False.
    """
    url = "https://www.google.com/recaptcha/api/siteverify"
    data = {
        "secret": settings.RECAPTCHA_SECRET_KEY,
        "response": token,
    }
    try:
        r = requests.post(url, data=data, timeout=5)
        result = r.json()
        return result.get("success", False)
    except requests.RequestException:
        return False


def send_activation_email(user, lang):
    """
    Генерирует активационный токен и отправляет письмо пользователю.
    """
    # Генерируем uidb64 на основе PK
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    # Генерируем токен
    token = default_token_generator.make_token(user)

    # Формируем ссылку активации.
    # Для примера укажем адрес фронтенда или Django-вью.
    # Например, если активация происходит через фронтенд по адресу /activate/uid/token:
    activation_link = f"https://pradelna1.cz/activate/{uid}/{token}"

    if lang == 'cz':
        subject = "Potvrďte svoji emailovou adresu"
        message = (
            f"Dobrý den.\n\n"
            f"Prosím, potvrďte svoji emailovou adresu, rozklikněte odkaz:\n{activation_link}\n\n"
            f"Děkuji vám"
        )
    elif lang == 'ru':
        subject = "Подтверждение email адреса"
        message = (
            f"Добрый день.\n\n"
            f"Пожалуйста подтвердите адрес электронной почты, перейдите по ссылке:\n{activation_link}\n\n"
            f"Спасибо.\n\n"
            f"Pradelna no.1"
        )
    else:
        subject = "Please confirm your email address"
        message = (
            f"Hello.\n\n"
            f"Please confirm your email address, click the link:\n{activation_link}\n\n"
            f"Thank you.\n\n"
            f"Pradelna no.1"
        )

    # Отправка письма
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
    except SMTPRecipientsRefused as e:
        # Логирование или обработка ошибки. Можно вернуть специальное значение или выбросить исключение.
        # Например, выбросим исключение, которое потом перехватит представление и вернёт JSON:
        raise Exception(f"SMTP error: {e}")



def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        return Response(
            {'detail': str(exc)},
            status=response.status_code
        )

    return response


class UnverifiedSMTPEmailBackend(EmailBackend):
    def open(self):
        """
        Открывает соединение с сервером, используя контекст, который не проверяет сертификаты.
        """
        if self.connection:
            return False
        try:
            # Создаем SSL контекст, который не проверяет сертификаты
            context = ssl._create_unverified_context()

            if self.use_ssl:
                # Для SSL (обычно порт 465)
                self.connection = self.connection_class(
                    self.host,
                    self.port,
                    timeout=self.timeout,
                    context=context
                )
            else:
                # Для STARTTLS (например, порт 587) или незащищенного соединения
                self.connection = self.connection_class(
                    self.host,
                    self.port,
                    timeout=self.timeout
                )
                self.connection.ehlo_or_helo_if_needed()
                if self.use_tls:
                    self.connection.starttls(context=context)
                    self.connection.ehlo()
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            return True
        except Exception:
            if not self.fail_silently:
                raise
            return False
