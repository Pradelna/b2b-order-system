from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .utils import get_items_by_language
from .models import *
from .serializer import *
from washpr import settings
from integration.tasks import send_contact_email_task


def landing_page(request):
    return render(request, 'index.html')


@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])  # Если аутентификация не требуется
def landing_page_view(request):
    """
    Функциональное представление для получения данных LandingPage.
    Принимаются только GET-запросы.
    Параметр 'lang' можно передать через GET-параметры.
    """
    lang = request.GET.get('lang', None)
    queryset = LandingPage.objects.all()
    items, error = get_items_by_language(queryset, lang)
    if error:
        return Response(error, status=status.HTTP_404_NOT_FOUND)
    serializer = LandingPageSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def send_contact_email(request):
    """
    Принимает данные формы контактов и отправляет письмо.
    Ожидается JSON с ключами: name, email, phone, message, project_name, admin_email, form_subject.
    """
    try:
        # Получаем данные из запроса
        data = request.data
        name = data.get('name', '')
        email = data.get('email', '')
        phone = data.get('phone', '')
        message_body = data.get('message', '')
        project_name = data.get('project_name', '')
        admin_email = data.get('admin_email', '')
        form_subject = data.get('form_subject', '')

        # Составляем тему и тело письма
        subject = f"[{project_name}] {form_subject}"
        message_text = f"Name: {name}\nEmail: {email}\nPhone: {phone}\nMessage: {message_body}"

        # Если хотите отправлять письмо асинхронно через Celery:
        send_contact_email_task.delay(subject, message_text, settings.DEFAULT_FROM_EMAIL, [admin_email])

        # Если Celery не используется, можно отправить синхронно:
        # send_mail(subject, message_text, settings.DEFAULT_FROM_EMAIL, [admin_email])

        return Response({"detail": "Email sent successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        # Логируем ошибку для отладки
        print("Error sending email:", str(e))
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
