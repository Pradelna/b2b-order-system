from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Customer, CustomerDocuments, DocumentsForCustomer
from .serializers import CustomerSerializer, CustomerGetSerializer, CustomerDocumentSerializer, \
    DocumentForCustomerSerializer


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
# @permission_classes([AllowAny])
def customer_view(request):
    if request.method == 'GET':
        # print(request.user.email)
        try:
            # Получаем клиента, связанного с текущим пользователем
            customer = Customer.objects.get(user=request.user)
            # customer = Customer.objects.get(pk=2)
            serializer = CustomerSerializer(customer)
            return Response(serializer.data)
        except Customer.DoesNotExist:
            return Response({"error": "Customer not found", "user_id": request.user.id}, status=404)

    elif request.method == 'POST':
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, company_email=request.user.email)  # Связываем клиента с пользователем
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'PUT':  # ✅ Добавлено обновление данных
        try:
            customer = Customer.objects.get(user=request.user)
            serializer = CustomerSerializer(customer, data=request.data, partial=True)
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_user_view(request):
    try:
        user = request.user
        serializer = CustomerGetSerializer(user)
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
    documents = CustomerDocuments.objects.filter(customer=customer)
    if len(documents) >= 5:
        return Response({"error": "You can't have more 5 files"}, status=400)
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


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_document(request, file_id):
    if not file_id:
        return Response({"error": "File ID is required."}, status=400)
    try:
        document = CustomerDocuments.objects.get(id=file_id, customer__user=request.user)
        document.file.delete()  # Удаление файла физически из файловой системы
        document.delete()       # Удаление записи из базы данных
        return Response({"message": "File deleted successfully!"}, status=status.HTTP_204_NO_CONTENT)
    except CustomerDocuments.DoesNotExist:
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_documents_for_customer(request):
    try:
        customer = Customer.objects.get(user=request.user)
    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=404)

    documents = DocumentsForCustomer.objects.filter(customer=customer)
    serializer = DocumentForCustomerSerializer(documents, many=True)
    return Response(serializer.data)
