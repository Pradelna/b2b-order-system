from django.contrib.auth.forms import PasswordResetForm
from rest_framework.permissions import IsAuthenticated, AllowAny
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
from rest_framework.decorators import api_view, permission_classes, authentication_classes
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
                print(serializer.data)
                send_activation_email(user, serializer.data["lang"])
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


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])  # Доступ для всех, включая неавторизованных пользователей
def api_password_reset(request):
    """
    API для сброса пароля.
    Ожидает JSON с ключом "email".
    Если email корректный и связан с пользователем, отправляет письмо для сброса пароля.
    """
    domain = request.get_host()
    protocol = 'https' if request.is_secure() else 'http'
    email = request.data.get("email")
    lang = request.data.get("lang")
    print(f"lang: {lang}")
    if not email:
        return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
    if lang == 'cz':
        email_template_name='registration/password_reset_email.txt'
        subject_template_name='registration/password_reset_subject.txt'
        html_email_template_name='registration/password_reset_email.html'
    elif lang == 'ru':
        email_template_name='registration/ru_password_reset_email.txt'
        subject_template_name='registration/ru_password_reset_subject.txt'
        html_email_template_name='registration/ru_password_reset_email.html'
    else:
        email_template_name='registration/en_password_reset_email.txt'
        subject_template_name='registration/en_password_reset_subject.txt'
        html_email_template_name='registration/en_password_reset_email.html'
    form = PasswordResetForm({"email": email})
    if form.is_valid():
        form.save(
            request=request,
            use_https=request.is_secure(),
            email_template_name=email_template_name,
            subject_template_name=subject_template_name,
            html_email_template_name=html_email_template_name,
            from_email=settings.DEFAULT_FROM_EMAIL,
            extra_email_context={
                'domain': domain,
                'protocol': protocol,
            }
        )
        return Response({"detail": "Password reset email sent."}, status=status.HTTP_200_OK)
    else:
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def api_password_reset_confirm(request, uidb64, token):
    if request.method == 'GET':
        # Перенаправляем GET-запрос на страницу React для сброса пароля.
        react_url = f"{settings.REACT_FRONTEND_URL}/reset-password/{uidb64}/{token}"
        return HttpResponseRedirect(react_url)
    elif request.method == 'POST':
        new_password = request.data.get("new_password")
        if not new_password:
            return Response({"error": "New password is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = get_user_model().objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            return Response({"error": "Invalid user."}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password has been reset successfully."}, status=status.HTTP_200_OK)


from django.http import HttpResponseRedirect

@api_view(['GET'])
@permission_classes([AllowAny])
def api_password_reset_complete(request):
    # Перенаправляем пользователя на страницу React с сообщением об успешном сбросе пароля
    react_url = f"{settings.REACT_FRONTEND_URL}/reset-password/done"
    return HttpResponseRedirect(react_url)
