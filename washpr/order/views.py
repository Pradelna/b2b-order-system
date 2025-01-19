from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from place.models import Place
from .models import Order
from .serializers import OrderSerializer, GetOrderSerializer
from datetime import datetime


def convert_date_to_unix(date_str):
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d")  # Преобразуем строку в объект datetime
        return int(date.timestamp())  # Преобразуем в Unix Timestamp
    except ValueError:
        return None


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        # Получаем данные из запроса
        data = request.data
        # Проверяем, принадлежит ли место текущему пользователю
        place = Place.objects.get(id=data.get('place'), customer__user=request.user)
        # Добавляем валидацию для других полей через сериализатор
        serializer = OrderSerializer(data=data)
        print(data)
        if serializer.is_valid():
            order = serializer.save(
                rp_place_street=place.rp_street,
                rp_place_number=place.rp_number,
                rp_place_zip=place.rp_zip,
                rp_time_from=convert_date_to_unix(data['date_pickup']),
                rp_time_to=convert_date_to_unix(data['date_delivery']),
                # rp_contract_external_id=
            )
            return Response(
                {"message": "Order created successfully!", "order_id": order.id},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Place.DoesNotExist:
        return Response(
            {"error": "The specified place does not exist or does not belong to the current user."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")
        return Response(
            {"error": f"An unexpected error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_place_orders(request, place_id):
    try:
        # Получаем заказы, связанные с данным местом
        orders = Order.objects.filter(place_id=place_id)

        # Сериализуем заказы
        serializer = GetOrderSerializer(orders, many=True)
        return Response(serializer.data)
    except Order.DoesNotExist:
        return Response({"error": "No orders found for this place"}, status=status.HTTP_404_NOT_FOUND)
