from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

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


# class LandingPageView(APIView):
#     def get(self, request):
#         lang = request.GET.get('lang', None)  # Получаем язык из запроса
#         queryset = LandingPage.objects.all()  # Базовый запрос
#
#         # Получаем данные с помощью вспомогательной функции
#         items, error = get_items_by_language(queryset, lang)
#
#         # Если возникла ошибка, возвращаем её
#         if error:
#             return Response(error, status=status.HTTP_404_NOT_FOUND)
#
#         # Формируем массив с данными
#         output = [
#             {
#                 'lang': item.lang,
#                 'prefix': item.prefix,
#                 'menu': {
#                     'about_us': item.menu_about_us,
#                     'technology': item.menu_technology,
#                     'prices': item.menu_prices,
#                     'services': item.menu_services,
#                     'linen_rent': item.menu_linen_rent,
#                     'vacancies': item.menu_vacancies,
#                     'contacts': item.menu_contacts,
#                     'button_request_call': item.menu_button_request_call,
#                 },
#                 'start_banner': {
#                     'title': item.start_banner_title,
#                     'description': item.start_banner_description,
#                     'button_request_call': item.start_banner_button_request_call,
#                     'button_two': item.start_banner_button_two,
#                 },
#                 'about_us': {
#                     'title': item.about_us_title,
#                     'description': item.about_us_description,
#                     'guarantee_quality': item.about_us_guarantee_quality,
#                     'fast_service': item.about_us_fast_service,
#                     'round_clock_service': item.about_us_round_clock_service,
#                     'super_quality': item.about_us_super_quality,
#                 },
#                 'service': {
#                     'title': item.service_title,
#                     'sub_title_1': item.service_sub_title_1,
#                     'description_1': item.service_description_1,
#                     'sub_title_2': item.service_sub_title_2,
#                     'description_2': item.service_description_2,
#                     'sub_title_3': item.service_sub_title_3,
#                     'description_3': item.service_description_3,
#                     'sub_title_4': item.service_sub_title_4,
#                     'description_4': item.service_description_4,
#                     'sub_title_5': item.service_sub_title_5,
#                     'description_5': item.service_description_5,
#                 },
#                 'technologies': {
#                     'title': item.technologies_title,
#                     'description': item.technologies_description,
#                     'sub_title_1': item.technologies_sub_title_1,
#                     'description_1': item.technologies_description_1,
#                     'sub_title_2': item.technologies_sub_title_2,
#                     'description_2': item.technologies_description_2,
#                     'sub_title_3': item.technologies_sub_title_3,
#                     'description_3': item.technologies_description_3,
#                     'sub_title_4': item.technologies_sub_title_4,
#                     'description_4': item.technologies_description_4,
#                     'sub_title_5': item.technologies_sub_title_5,
#                     'description_5': item.technologies_description_5,
#                     'sub_title_6': item.technologies_sub_title_6,
#                     'description_6': item.technologies_description_6,
#                 },
#                 'price': {
#                     'title': item.price_title,
#                     'description': item.price_description,
#                     'button_text': item.price_button_text,
#                 },
#                 'contacts': {
#                     'title': item.contacts_title,
#                     'company_address': item.contacts_company_address,
#                     'laundry_address': item.contacts_laundry_address,
#                     'form_name': item.contacts_form_name,
#                     'form_email': item.contacts_form_email,
#                     'form_phone': item.contacts_form_phone,
#                     'form_message': item.contacts_form_message,
#                     'button_text': item.contacts_button_text,
#                     'agree': item.contacts_agree,
#                     'agree_link': item.contacts_agree_link,
#                     'map_link': item.contacts_map_link,
#                 },
#                 'footer': {
#                     'cookies': item.footer_cookies,
#                     'cookies_link': item.footer_cookies_link,
#                     'privacy_policy': item.footer_privacy_policy,
#                     'privacy_policy_link': item.footer_privacy_policy_link,
#                 },
#             }
#             for item in items
#         ]
#
#         # Возвращаем данные в формате JSON
#         return Response(output, status=status.HTTP_200_OK)
#
#     def post(self, request):
#         serializer = LandingSerializer(data=request.data)
#         if serializer.is_valid(raise_exception=True):
#             serializer.save()
#             return Response(serializer.data)


class LandingPageView(APIView):
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
