from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Customer, CustomerDocuments
from .serializers import CustomerSerializer, CustomerGetSerializer, CustomerDocumentSerializer


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def customer_view(request):
    if request.method == 'GET':
        try:
            # Получаем клиента, связанного с текущим пользователем
            print(request.user.email)
            print("request.user.id")
            customer = Customer.objects.get(user=request.user)
            serializer = CustomerGetSerializer(customer)
            return Response(serializer.data)
        except Customer.DoesNotExist:
            print('error - no customer')
            return Response({"error": "Customer not found"}, status=404)

    elif request.method == 'POST':
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, company_email=request.user.email)  # Связываем клиента с пользователем
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'PUT':  # ✅ Добавлено обновление данных
        try:
            customer = Customer.objects.get(user=request.user)
            serializer = CustomerSerializer(customer, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Customer.DoesNotExist:
            return Response({"error": "Customer not found"}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_detail_view(request, customer_id):
    try:
        customer = Customer.objects.get(user__id=customer_id)
        serializer = CustomerGetSerializer(customer)
        return Response(serializer.data)
    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_document(request):
    try:
        customer = Customer.objects.get(user=request.user)
    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=404)

    mutable_data = request.data.copy()
    mutable_data['customer'] = customer.id

    serializer = CustomerDocumentSerializer(data=mutable_data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "File uploaded successfully!"}, status=201)
    else:
        return Response({"error": "Invalid data", "details": serializer.errors}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_customer_documents(request):
    try:
        customer = Customer.objects.get(user=request.user)
    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=404)

    documents = CustomerDocuments.objects.filter(customer=customer)
    serializer = CustomerDocumentSerializer(documents, many=True)
    return Response(serializer.data)
