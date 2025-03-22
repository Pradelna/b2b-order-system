from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Customer, CustomerDocuments


class CustomerSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Customer
        fields = [
            'user_id',
            'new_company_name',
            'new_company_address',
            'new_company_ico',
            'new_company_dic',
            'company_name',
            'company_address',
            'company_ico',
            'company_dic',
            'company_phone',
            'company_person',
            'company_email',
            'vop',
            'terms_of_use',
            'gdpr',
            'active',
            'change_data',
            'weekend_able'
        ]
        read_only_fields = ['user', 'user_id', 'company_email']  # Поля остаётся только для чтения


class CustomerGetSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', format='%d-%m-%Y', read_only=True)
    class Meta:
        model = Customer
    class Meta:
        model = Customer
        fields = [
            'user_id',
            'new_company_name',
            'new_company_address',
            'new_company_ico',
            'new_company_dic',
            'company_name',
            'company_address',
            'company_ico',
            'company_dic',
            'company_phone',
            'company_email',
            'company_person',
            'active',
            'change_data',
            'weekend_able',
            'date_joined'
        ]
        read_only_fields = ['user_id', 'date_joined']


class CustomerDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerDocuments
        fields = ['id', 'customer', 'file', 'uploaded_at']
        extra_kwargs = {
            'uploaded_at': {'read_only': True}
        }


class DocumentForCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerDocuments
        fields = ['id', 'customer', 'file', 'uploaded_at']
        read_only_fields = ['uploaded_at', 'site_file']
