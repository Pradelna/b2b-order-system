from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Place
from .serializers import PlaceSerializer, GetPlaceSerializer
from customer.models import Customer


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def create_place(request):
#     try:
#         # Получаем текущего пользователя
#         print("try")
#         customer = Customer.objects.get(user=request.user)
#     except Customer.DoesNotExist:
#         return Response({"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)
#
#     # Добавляем `customer` в request.data для сохранения связи
#     data = request.data.copy()
#     data['customer'] = customer.id
#
#     serializer = PlaceSerializer(data=data)
#     print(serializer)
#     if serializer.is_valid():
#         serializer.save(customer=customer)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_list_place(request):
#     try:
#         # Получаем текущего пользователя
#         customer = Customer.objects.get(user=request.user)
#         places = Place.objects.filter(Q(customer=customer) & Q(active=True))
#         serializer = GetPlaceSerializer(places, many=True)
#         return Response(serializer.data)
#     except Place.DoesNotExist:
#         return Response({"error": "Places not found"}, status=status.HTTP_404_NOT_FOUND)
