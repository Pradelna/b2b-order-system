from rest_framework import serializers
from .models import *


class MenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = Menu
        fields = [
            'lang',
            'prefix',
            'about_us',
            'technology',
            'prices',
            'services',
            'linen_rent',
            'vacancies',
            'contacts',
            'button_request_call',
        ]


class StartBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StartBanner
        fields = [
            'lang',
            'prefix',
            'title',
            'description',
            'button_request_call',
            'button_two',
        ]


class AboutUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutUs
        fields = [
            'lang',
            'prefix',
            'title',
            'description',
            'guarantee_quality',
            'fast_service',
            'round_clock_service',
            'super_quality',
        ]


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = [
            'lang',
            'prefix',
            'title',
            'sub_title_1',
            'description_1',
            'sub_title_2',
            'description_2',
            'sub_title_3',
            'description_3',
            'sub_title_4',
            'description_4',
            'sub_title_5',
            'description_5',
        ]


class TechnologiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Technologies
        fields = [
            'lang',
            'prefix',
            'title',
            'description',
            'sub_title_1',
            'description_1',
            'sub_title_2',
            'description_2',
            'sub_title_3',
            'description_3',
            'sub_title_4',
            'description_4',
            'sub_title_5',
            'description_5',
            'sub_title_6',
            'description_6',
        ]


class PriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Price
        fields = [
            'lang',
            'prefix',
            'title',
            'description',
            'button_text',
        ]


class ContactsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contacts
        fields = [
            'lang',
            'prefix',
            'title',
            'company_address',
            'laundry_address',
            'form_name',
            'form_email',
            'form_phone',
            'form_message',
            'button_text',
            'agree',
            'agree_link',
            'map_link',
        ]


class FooterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Footer
        fields = [
            'lang',
            'prefix',
            'cookies',
            'cookies_link',
            'privacy_policy',
            'privacy_policy_link',
        ]


class LandingPageSerializer(serializers.ModelSerializer):
    # Кастомные поля
    menu = serializers.SerializerMethodField()
    start_banner = serializers.SerializerMethodField()
    about_us = serializers.SerializerMethodField()
    service = serializers.SerializerMethodField()
    technologies = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    contacts = serializers.SerializerMethodField()
    footer = serializers.SerializerMethodField()

    class Meta:
        model = LandingPage
        fields = [
            'lang', 'prefix', 'menu', 'start_banner', 'about_us',
            'service', 'technologies', 'price', 'contacts', 'footer',
        ]

    def get_menu(self, obj):
        return {
            'about_us': obj.menu_about_us,
            'technology': obj.menu_technology,
            'prices': obj.menu_prices,
            'services': obj.menu_services,
            'linen_rent': obj.menu_linen_rent,
            'vacancies': obj.menu_vacancies,
            'contacts': obj.menu_contacts,
            'button_request_call': obj.menu_button_request_call,
        }

    def get_start_banner(self, obj):
        return {
            'title': obj.start_banner_title,
            'description': obj.start_banner_description,
            'button_request_call': obj.start_banner_button_request_call,
            'button_two': obj.start_banner_button_two,
        }

    def get_about_us(self, obj):
        return {
            'title': obj.about_us_title,
            'description': obj.about_us_description,
            'guarantee_quality': obj.about_us_guarantee_quality,
            'fast_service': obj.about_us_fast_service,
            'round_clock_service': obj.about_us_round_clock_service,
            'super_quality': obj.about_us_super_quality,
        }

    def get_service(self, obj):
        return {
            'title': obj.service_title,
            'sub_title_1': obj.service_sub_title_1,
            'description_1': obj.service_description_1,
            'sub_title_2': obj.service_sub_title_2,
            'description_2': obj.service_description_2,
            'sub_title_3': obj.service_sub_title_3,
            'description_3': obj.service_description_3,
            'sub_title_4': obj.service_sub_title_4,
            'description_4': obj.service_description_4,
            'sub_title_5': obj.service_sub_title_5,
            'description_5': obj.service_description_5,
        }

    def get_technologies(self, obj):
        return {
            'title': obj.technologies_title,
            'description': obj.technologies_description,
            'sub_title_1': obj.technologies_sub_title_1,
            'description_1': obj.technologies_description_1,
            'sub_title_2': obj.technologies_sub_title_2,
            'description_2': obj.technologies_description_2,
            'sub_title_3': obj.technologies_sub_title_3,
            'description_3': obj.technologies_description_3,
            'sub_title_4': obj.technologies_sub_title_4,
            'description_4': obj.technologies_description_4,
            'sub_title_5': obj.technologies_sub_title_5,
            'description_5': obj.technologies_description_5,
            'sub_title_6': obj.technologies_sub_title_6,
            'description_6': obj.technologies_description_6,
        }

    def get_price(self, obj):
        return {
            'title': obj.price_title,
            'description': obj.price_description,
            'button_text': obj.price_button_text,
        }

    def get_contacts(self, obj):
        return {
            'title': obj.contacts_title,
            'company_address': obj.contacts_company_address,
            'laundry_address': obj.contacts_laundry_address,
            'form_name': obj.contacts_form_name,
            'form_email': obj.contacts_form_email,
            'form_phone': obj.contacts_form_phone,
            'form_message': obj.contacts_form_message,
            'button_text': obj.contacts_button_text,
            'agree': obj.contacts_agree,
            'agree_link': obj.contacts_agree_link,
            'map_link': obj.contacts_map_link,
        }

    def get_footer(self, obj):
        return {
            'cookies': obj.footer_cookies,
            'cookies_link': obj.footer_cookies_link,
            'privacy_policy': obj.footer_privacy_policy,
            'privacy_policy_link': obj.footer_privacy_policy_link,
        }
