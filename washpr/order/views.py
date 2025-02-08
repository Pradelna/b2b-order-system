from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from place.models import Place
from rest_framework.views import APIView

from .models import Order, OrderReport
from .serializers import OrderSerializer, GetOrderSerializer, OrderReportSerializer
from datetime import datetime

from customer.models import Customer


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
        if serializer.is_valid():
            # n = 0
            # limit = 20
            # while n <= limit:
            #     n += 1
            #     order_n = Order(
            #         user=request.user,
            #         place=place,
            #         type_ship='pickup_ship_one',
            #         system='every_day',
            #         active=True,
            #         rp_time_from=1737936000,
            #         rp_time_to=1738108800,
            #         rp_place_street=place.rp_street,
            #         rp_place_number=place.rp_number,
            #         rp_place_zip=place.rp_zip,
            #     )
            #     order_n.save()
            order = serializer.save(
                rp_place_street=place.rp_street,
                rp_place_number=place.rp_number,
                rp_place_zip=place.rp_zip,
                rp_time_from=convert_date_to_unix(data['date_pickup']),
                rp_time_to=convert_date_to_unix(data['date_delivery']),
                rp_place_title=place.place_name,
                place=place,
                active=True,
                user=request.user,
            )
            order_data = OrderSerializer(order).data
            return Response(
                {"message": "Order created successfully!", "order": order_data},
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
        orders = Order.objects.filter(place_id=place_id).order_by('-id')

        # Сериализуем заказы
        serializer = GetOrderSerializer(orders, many=True)
        return Response(serializer.data)
    except Order.DoesNotExist:
        return Response({"error": "No orders found for this place"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    try:
        user = request.user
        orders = Order.objects.filter(place__customer__user=user)
        serializer = GetOrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_orders(request):
    try:
        user = request.user
        orders = Order.objects.filter(user=user)
        serializer = GetOrderSerializer(orders, many=True)
        # print(serializer.data)
        print("ok")
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    serializer = OrderSerializer(order, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    # if not serializer.is_valid():
    #     print(serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserReportListView(generics.ListAPIView, LoginRequiredMixin):
    """ Returns a list of reports for the authenticated user. """
    serializer_class = OrderReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        customer = self.request.user.customer
        return OrderReport.objects.filter(user=self.request.user.customer).order_by("-report_month")


class UserReportDetailView(generics.RetrieveAPIView, LoginRequiredMixin):
    """ Returns a specific report by ID. """
    serializer_class = OrderReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OrderReport.objects.filter(user=self.request.user)


class GenerateMonthlyReport(APIView):
    """
    Endpoint to generate a monthly report for a user.
    It checks for orders in the past month that haven't been included in a report.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        from datetime import datetime, timedelta
        from order.models import Order

        today = datetime.today()
        first_day_of_month = today.replace(day=1)
        last_month = first_day_of_month - timedelta(days=1)

        # Get orders that are not yet in a report
        existing_orders = OrderReport.objects.filter(user=user).values_list("orders", flat=True)
        new_orders = Order.objects.filter(user=user, created_at__year=last_month.year, created_at__month=last_month.month).exclude(id__in=existing_orders)

        if new_orders.exists():
            report = OrderReport.objects.create(user=user, report_month=last_month)
            report.orders.set(new_orders)
            report.save()
            return Response({"message": "Report generated successfully", "report_id": report.id}, status=201)

        return Response({"message": "No new orders to report"}, status=200)
