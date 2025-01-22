from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .utils import get_items_by_language
from .models import *
from .serializer import *


def landing_page(request):
    return render(request, 'index.html')


class LandingPageView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        lang = request.GET.get('lang', None)  # Получаем язык из запроса
        queryset = LandingPage.objects.all()  # Базовый запрос

        # Получаем данные с помощью вспомогательной функции
        items, error = get_items_by_language(queryset, lang)

        # Если возникла ошибка, возвращаем её
        if error:
            return Response(error, status=status.HTTP_404_NOT_FOUND)

        serializer = LandingPageSerializer(queryset, many=True)
        # print(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = LandingPageSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
