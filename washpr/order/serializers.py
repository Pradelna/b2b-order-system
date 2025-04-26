from rest_framework import serializers
from .models import Order, ReportFile, OrderReport, PhotoReport


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'place', 'rp_place_title', 'type_ship', 'system', 'monday', 'tuesday', 'wednesday', 'thursday',
            'friday', 'saturday', 'sunday', 'date_pickup', 'date_delivery', 'every_week', 'rp_customer_note', 'terms',
            'active', 'end_order', 'rp_status', 'date_start_day', 'created_at', 'canceled', 'id',
            'rp_problem_description', 'rp_contract_external_id', 'rp_time_planned'
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
            'monday', 'tuesday', 'wednesday', 'thursday', 'friday' 'saturday', 'sunday'
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
            'id', 'place', 'user', 'place_name', 'type_ship', 'system', 'monday', 'tuesday', 'date_start_day',
            'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'date_pickup', 'date_delivery', 'created_at',
            'every_week', 'terms', 'end_order', 'rp_customer_note', 'rp_problem_description', 'group_pair_id',
            'canceled', 'rp_time_from', 'rp_time_to', 'rp_time_realization', 'rp_time_planned', 'rp_problem_description',
            'rp_status', 'rp_contract_external_id', 'pickup', 'delivery'
        ]
        read_only_fields = ['id', 'user', 'place', 'created_at', 'rp_contract_external_id']


class PhotoReportSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    group_pair_id = serializers.IntegerField(source='order.group_pair_id', read_only=True)
    class Meta:
        model = PhotoReport
        fields = ["id", "order_id", "file_id", "group_pair_id", "mime", "uploaded_at"]


class DownloadPhotoReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhotoReport
        fields = ["file_id", "name", "mime"]


class ReportFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportFile
        fields = ["id", "file", "uploaded_at"]

class OrderReportSerializer(serializers.ModelSerializer):
    files = ReportFileSerializer(many=True, read_only=True)  # Fetch associated files
    orders_count = serializers.SerializerMethodField()  # Get number of orders

    class Meta:
        model = OrderReport
        fields = ["id", "report_month", "created_at", "orders", "orders_count", "files", "customer"]
        read_only_fields = ['customer']

    def get_orders_count(self, obj):
        return obj.orders.count()


class CurrentOrderSerializer(serializers.ModelSerializer):

    class Meta:
        model = Order
        fields = ["id","place", "rp_time_planned"]
