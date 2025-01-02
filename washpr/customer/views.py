from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Customer
from .serializers import CustomerSerializer, CustomerGetSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def customer_view(request):
    if request.method == 'GET':
        try:
            # Получаем клиента, связанного с текущим пользователем
            print(request.user.id)
            print("request.user.id")
            customer = Customer.objects.get(user=request.user)
            serializer = CustomerGetSerializer(customer)
            return Response(serializer.data)
        except Customer.DoesNotExist:
            print('error - no customer')
            return Response({"error": "Customer not found"}, status=404)

    if request.method == 'POST':
        print("Received data:", request.data)
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, company_email=request.user.email)  # Связываем клиента с пользователем
            return Response(serializer.data)
        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=400)
