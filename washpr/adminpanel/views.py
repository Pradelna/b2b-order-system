import os

from celery.worker.control import active
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required, user_passes_test

from customer.models import Customer
from order.models import Order
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.http import HttpResponse
from django.conf import settings
from urllib.parse import urlparse, quote
import boto3

from customer.serializers import CustomerGetSerializer
from place.models import Place
from place.serializers import PlaceSerializer
from customer.models import CustomerDocuments
from customer.models import DocumentsForCustomer
from customer.serializers import CustomerDocumentSerializer
from customer.serializers import DocumentForCustomerSerializer
from order.models import PhotoReport
from order.serializers import PhotoReportSerializer
from order.serializers import GetOrderSerializer
from order.models import OrderReport
from order.serializers import OrderReportSerializer
from order.models import ReportFile
from order.serializers import ReportFileSerializer
from customer.serializers import CustomerSerializer
from rest_framework.views import APIView


@login_required
def check_is_admin(request):
    return JsonResponse({'is_admin': request.user.is_staff})

@user_passes_test(lambda u: u.is_staff)
def total_customers(request):
    total = Customer.objects.filter(active=True).count()
    return JsonResponse({"total_customers": total})

@user_passes_test(lambda u: u.is_staff)
def total_orders(request):
    total = Order.objects.filter(processed=True, delivery=True).count()
    return JsonResponse({"total_orders": total})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def new_customers(request):
    recent = Customer.objects.filter(active=False, data_sent=False).order_by('-user__date_joined')
    serializer = CustomerGetSerializer(recent, many=True)
    return Response({"customers": serializer.data})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def customer_details(request, customer_id):
    customer = get_object_or_404(Customer, user__id=customer_id)
    serializer = CustomerGetSerializer(customer)
    return Response({"customer": serializer.data})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def customers_places(request, customer_id):
    customer = get_object_or_404(Customer, user__id=customer_id)
    places = Place.objects.filter(customer=customer)
    serializer = PlaceSerializer(places, many=True)
    return Response({"places": serializer.data})

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def put_customer(request, customer_id):
    if request.method == 'PUT':
        try:
            customer = Customer.objects.get(user__id=customer_id)
            serializer = CustomerGetSerializer(customer, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Customer.DoesNotExist:
            return Response({"error": "Customer not found"}, status=404)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def upload_document(request, customer_id):
    try:
        customer = Customer.objects.get(user__id=customer_id)
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
@permission_classes([IsAdminUser])
def list_customer_documents_admin(request, customer_id):
    try:
        customer = Customer.objects.get(user__id=customer_id)
    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=404)

    documents = CustomerDocuments.objects.filter(customer=customer)
    serializer = CustomerDocumentSerializer(documents, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_document_admin(request, file_id, customer_id):
    if not file_id:
        return Response({"error": "File ID is required."}, status=400)
    try:
        document = CustomerDocuments.objects.get(id=file_id, customer__user__id=customer_id)
        document.file.delete()  # Удаление файла физически из файловой системы
        document.delete()       # Удаление записи из базы данных
        return Response({"message": "File deleted successfully!"}, status=status.HTTP_204_NO_CONTENT)
    except CustomerDocuments.DoesNotExist:
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_documents_for_customer_admin(request, customer_id):
    try:
        customer = Customer.objects.get(user__id=customer_id)
    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=404)

    documents = DocumentsForCustomer.objects.filter(customer=customer)
    serializer = DocumentForCustomerSerializer(documents, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_place_detail_admin(request, place_id):
    try:
        # Получаем место по ID
        place = Place.objects.get(id=place_id)
        customer_name = place.customer.company_name
        user_id = place.customer.user_id
        serializer = PlaceSerializer(place)
        return Response({
            "customer_name": customer_name,
            "user_id": user_id,
            "place": serializer.data,

        }, status=status.HTTP_200_OK)
    except Place.DoesNotExist:
        return Response({"error": "Place not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_photo_reports_admin(request, place_id):
    try:
        photos = PhotoReport.objects.filter(order__place__id=place_id)
        serializer = PhotoReportSerializer(photos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_photo_reports_admin(request, customer_id):
    try:
        photos = PhotoReport.objects.filter(order__user__id=customer_id)
        serializer = PhotoReportSerializer(photos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_user_orders_admin(request, customer_id):
    try:
        orders = Order.objects.filter(user__id=customer_id)
        serializer = GetOrderSerializer(orders, many=True)
        return Response({
            "user_id": customer_id,
            "orders": serializer.data,

        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_user_report_admin(request, customer_id):
    try:
        reports = OrderReport.objects.filter(customer__user__id=customer_id).order_by("-report_month")
        serializer = OrderReportSerializer(reports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser])
def upload_report_file(request, report_id):
    report = OrderReport.objects.get(id=report_id)
    file = request.FILES.get('file')

    if not file:
        return Response({'error': 'No file provided'}, status=400)

    report_file = ReportFile.objects.create(report=report, file=file)
    serializer = ReportFileSerializer(report_file)

    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_report_file(request, report_id, file_id):
    try:
        report_file = ReportFile.objects.get(report_id=report_id, id=file_id)
        file_path = report_file.file.path

        if os.path.exists(file_path):
            os.remove(file_path)

        report_file.delete()
        return Response({'success': True})
    except ReportFile.DoesNotExist:
        return Response({'error': 'File not found'}, status=404)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10

    def get_paginated_response(self, data):
        total_pages = self.page.paginator.num_pages
        return Response({
            'count': self.page.paginator.count,
            'total_pages': total_pages,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def all_customers(request):
    paginator = StandardResultsSetPagination()
    customers = Customer.objects.filter(vop=True).order_by('-user__date_joined')
    result_page = paginator.paginate_queryset(customers, request)
    serializer = CustomerGetSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def search_customers(request):
    query = request.GET.get('q', '').strip()
    if not query:
        return Response({"results": []})

    customers = Customer.objects.filter(
        Q(company_name__icontains=query) |
        Q(company_address__icontains=query) |
        Q(company_ico__icontains=query) |
        Q(company_phone__icontains=query) |
        Q(company_email__icontains=query) |
        Q(company_person__icontains=query)
    ).order_by('-user__date_joined')[:20]  # Ограничим, например, до 20 результатов
    serializer = CustomerSerializer(customers, many=True)
    return Response({"results": serializer.data})
