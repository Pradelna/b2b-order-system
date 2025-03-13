from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Place
from .serializers import PlaceSerializer
from customer.models import Customer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_place(request):
    try:
        # Получаем текущего пользователя
        customer = Customer.objects.get(user=request.user)
    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)

    # Добавляем `customer` в request.data для сохранения связи
    data = request.data.copy()
    data['customer'] = customer.id

    serializer = PlaceSerializer(data=data)
    if serializer.is_valid():
        serializer.save(customer=customer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_place(request, place_id):
    try:
        # get current customer
        customer = Customer.objects.get(user=request.user)
    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)
    try:
        # get current place
        place = Place.objects.get(id=place_id)
    except Place.DoesNotExist:
        return Response({"error": "Place not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()
    data['customer'] = customer.id
    data['id'] = place.id
    serializer = PlaceSerializer(instance=place, data=data, partial=True)
    if serializer.is_valid():
        # print(serializer.validated_data)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_list_place(request):
    try:
        # Получаем текущего пользователя
        customer = Customer.objects.get(user=request.user)
    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)
    places = Place.objects.filter(customer=customer, active=True, deleted=False)
    if not places.exists():
        return Response({"error": "Places not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = PlaceSerializer(places, many=True)
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_place_detail(request, place_id):
    try:
        # Получаем место по ID
        place = Place.objects.get(id=place_id, customer__user=request.user)
        # serializer = GetPlaceSerializer(place)
        serializer = PlaceSerializer(place)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Place.DoesNotExist:
        return Response({"error": "Place not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_place(request, place_id):
    if not place_id:
        return Response({"error": "Place ID is required."}, status=400)
    try:
        place = Place.objects.get(id=place_id, customer__user=request.user)
        place.delete()
        return Response({"message": "Place deleted successfully!"}, status=status.HTTP_204_NO_CONTENT)
    except Place.DoesNotExist:
        return Response({"error": "Place not found"}, status=status.HTTP_404_NOT_FOUND)
