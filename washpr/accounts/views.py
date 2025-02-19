from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from smtplib import SMTPRecipientsRefused

from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import RegisterSerializer
from .utils import verify_recaptcha, send_activation_email
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]  # Позволяет доступ всем
    authentication_classes = []
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
            user = serializer.save()
            # Отправляем активационное письмо
            try:
                send_activation_email(user)
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"message": "User created. Check your email for activation link."},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


User = get_user_model()


class ActivateAccountView(APIView):
    permission_classes = [permissions.AllowAny]  # Разрешаем доступ всем
    authentication_classes = []  # Отключаем проверку аутентификации

    def post(self, request):
        uidb64 = request.data.get("uidb64")
        token = request.data.get("token")

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"message": "Invalid activation link"}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({"message": "Account activated successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)


class AccountDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # Требуется аутентификация
    authentication_classes = [JWTAuthentication]  # Используем JWT для аутентификации

    def get(self, request):
        # Доступно только авторизованным
        data = {
            "user_email": request.user.email,
            "some_data": "secret info"
        }
        return Response(data, status=status.HTTP_200_OK)
