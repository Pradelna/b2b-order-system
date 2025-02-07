from rest_framework import serializers
from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'place', 'rp_place_title', 'type_ship', 'system', 'monday', 'tuesday', 'wednesday', 'thursday',
            'friday', 'date_pickup', 'date_delivery', 'every_week', 'rp_customer_note', 'terms', 'active',
            'end_order', 'rp_status', 'date_start_day', 'created_at', 'canceled', 'id'
        ]
        extra_kwargs = {
            'terms': {'required': True},
            'place': {'required': True},
            'date_pickup': {'required': True},
            'date_delivery': {'required': True},
        }
        read_only_fields = ['created_at', 'id']

    def validate(self, data):
        # Дополнительная валидация
        if not self.partial and data.get('system') is None and not any([data.get(day) for day in [
            'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
        ]]):
            raise serializers.ValidationError("Either 'system' or at least one day of the week must be selected.")
        if not self.partial and not data.get('every_week'):
            if data.get('date_delivery') < data.get('date_pickup'):
                raise serializers.ValidationError("Delivery date cannot be earlier than pick-up date.")
        return data

    def create(self, validated_data):
        # Создаем новый заказ
        return Order.objects.create(**validated_data)


class GetOrderSerializer(serializers.ModelSerializer):
    place_name = serializers.CharField(source='place.place_name', read_only=True)
    class Meta:
        model = Order
        fields = [
            'id', 'place', 'place_name', 'type_ship', 'system', 'monday', 'tuesday',
            'wednesday', 'thursday', 'friday', 'date_pickup', 'date_delivery', 'created_at',
            'every_week', 'terms', 'end_order', 'rp_problem_description', 'date_start_day', 'canceled'
        ]
        read_only_fields = ['id', 'place', 'created_at']
