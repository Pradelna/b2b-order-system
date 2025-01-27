import requests
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth import get_user_model
from rest_framework.views import exception_handler


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


def send_activation_email(user):
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
    activation_link = f"http://127.0.0.1:5173/activate/{uid}/{token}"

    subject = "Activate your account"
    message = (
        f"Hi {user.email},\n\n"
        f"Please click the link below to activate your account:\n{activation_link}\n\n"
        f"Thank you!"
    )

    # Отправка письма
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,  # Или любой email-отправитель
        [user.email],
        fail_silently=False,
    )



def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        response.data['status_code'] = response.status_code

    return response
