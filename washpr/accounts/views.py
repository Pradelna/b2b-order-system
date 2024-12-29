from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.conf import settings
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
            send_activation_email(user)
            return Response({"message": "User created. Check your email for activation link."},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


User = get_user_model()


@api_view(['POST'])
def api_activate_account(request):
    uidb64 = request.data.get('uidb64')
    token = request.data.get('token')

    try:
        user_id = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return Response({'message': 'Account activated successfully'}, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Invalid or expired link'}, status=status.HTTP_400_BAD_REQUEST)
