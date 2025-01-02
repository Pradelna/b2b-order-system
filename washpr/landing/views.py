from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .utils import get_items_by_language
from .models import *
from .serializer import *


def landing_page(request):
    return render(request, 'index.html')


class LanguagesView(APIView):
    def get(self, request):
        # get languages from database
        languages = Menu.objects.values('lang', 'prefix').distinct()

        if not languages:
            return Response(
                {"error": "Languages aren't"},
                status=status.HTTP_404_NOT_FOUND
            )

        # return languages
        return Response(list(languages), status=status.HTTP_200_OK)


class MenuView(APIView):
    def get(self, request):
        lang = request.GET.get('lang', None)  # Получаем язык из запроса
        queryset = Menu.objects.all()  # Базовый запрос

        # Получаем данные с помощью вспомогательной функции
        items, error = get_items_by_language(queryset, lang)

        # Если возникла ошибка, возвращаем её
        if error:
            return Response(error, status=status.HTTP_404_NOT_FOUND)

        # Формируем массив с данными
        output = [
            {
                'lang': item.lang,
                'prefix': item.prefix,
                'about_us': item.about_us,
                'technology': item.technology,
                'prices': item.prices,
                'services': item.services,
                'linen_rent': item.linen_rent,
                'vacancies': item.vacancies,
                'contacts': item.contacts,
                'button_request_call': item.button_request_call,
            }
            for item in items
        ]

        # Возвращаем данные в формате JSON
        return Response(output, status=status.HTTP_200_OK)


class BannerView(APIView):
    def get(self, request):
        lang = request.GET.get('lang', None)  # Получаем язык из запроса
        queryset = StartBanner.objects.all()  # Базовый запрос

        # Получаем данные с помощью вспомогательной функции
        items, error = get_items_by_language(queryset, lang)

        # Если возникла ошибка, возвращаем её
        if error:
            return Response(error, status=status.HTTP_404_NOT_FOUND)

        # Формируем массив с данными
        output = [
            {
                'lang': item.lang,
                'prefix': item.prefix,
                'title': item.title,
                'description': item.description,
                'button_request_call': item.button_request_call,
                'button_two': item.button_two,
            }
            for item in items
        ]

        # Возвращаем данные в формате JSON
        return Response(output, status=status.HTTP_200_OK)


class OtherView(APIView):
    def get(self, request):
        output = [
            {
                'lang': output.lang,
                'prefix': output.prefix,
                'about_us': output.about_us,
                'technology': output.technology,
                'prices': output.prices,
                'services': output.services,
                'linen_rent': output.linen_rent,
                'vacancies': output.vacancies,
                'contacts': output.contacts,
                'button_request_call': output.button_request_call,
            } for output in Menu.objects.all()
        ]
        return Response(output)

    def post(self, request):
        serializer = MenuSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)


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
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = LandingPageSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
