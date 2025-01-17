from rest_framework import serializers
from .models import Place


class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = [
            'customer', 'place_name', 'active', 'rp_client_external_id',
            'rp_client_name', 'rp_client_id', 'rp_id', 'rp_external_id',
            'rp_title', 'rp_city', 'rp_street', 'rp_number', 'rp_zip',
            'rp_person', 'rp_phone', 'rp_email'
        ]
        extra_kwargs = {
            'customer': {'read_only': True},
        }


from rest_framework import serializers
from .models import Place


class GetPlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = [
            'id', 'customer', 'place_name', 'active', 'rp_client_external_id',
            'rp_client_name', 'rp_client_id', 'rp_id', 'rp_external_id',
            'rp_title', 'rp_city', 'rp_street', 'rp_number', 'rp_zip',
            'rp_person', 'rp_phone', 'rp_email'
        ]
        extra_kwargs = {
            'customer': {'read_only': True},
            'id': {'read_only': True},
        }

