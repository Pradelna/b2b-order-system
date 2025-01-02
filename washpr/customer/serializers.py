from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['company_name', 'company_address', 'company_ico', 'company_phone', 'company_person']
        read_only_fields = ['user', 'company_email']  # Поле user заполняется автоматически


class CustomerGetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['company_name', 'company_address', 'company_ico', 'company_phone', 'company_email',  'company_person']
        read_only_fields = ['user']  # Поле user заполняется автоматически
