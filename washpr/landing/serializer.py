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
