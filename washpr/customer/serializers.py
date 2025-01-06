from rest_framework import serializers
from .models import Customer, CustomerDocuments


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['company_name', 'company_address', 'company_ico', 'company_phone', 'company_person']
        read_only_fields = ['user', 'company_email']  # Поле user заполняется автоматически


class CustomerGetSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    class Meta:
        model = Customer
        fields = [
            'user_id',
            'company_name',
            'company_address',
            'company_ico',
            'company_phone',
            'company_email',
            'company_person'
        ]
        read_only_fields = ['user']  # Поле user заполняется автоматически


class CustomerDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerDocuments
        fields = ['customer', 'file', 'uploaded_at']
        extra_kwargs = {
            'uploaded_at': {'read_only': True}
        }
