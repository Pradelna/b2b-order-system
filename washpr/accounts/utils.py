import requests
from django.conf import settings


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
