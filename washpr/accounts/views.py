from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.conf import settings
from .serializers import RegisterSerializer
from .utils import verify_recaptcha


class RegisterView(APIView):
    def post(self, request):
        # 1. Достаём токен из тела запроса
        captcha_token = request.data.get("captchaToken", None)

        # 2. Проверяем капчу
        if not captcha_token or not verify_recaptcha(captcha_token):
            return Response({"detail": "Invalid reCAPTCHA. Are you a robot?"},
                            status=status.HTTP_400_BAD_REQUEST)

        # 3. Если капча пройдена, выполняем стандартную логику регистрации
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
