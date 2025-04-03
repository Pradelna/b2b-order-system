from django.contrib.auth import get_user_model
from django.db import transaction
from django.http import HttpResponse, Http404
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
import boto3
from urllib.parse import quote
from django.conf import settings
from urllib.parse import urlparse
import logging

from .models import Customer, CustomerDocuments, DocumentsForCustomer
from .serializers import CustomerSerializer, CustomerGetSerializer, CustomerDocumentSerializer, \
    DocumentForCustomerSerializer
from order.models import ReportFile

from integration.tasks import create_client_task, send_email_change_customer_task, send_new_customer_task

User = get_user_model()


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def customer_view(request):
    if request.method == 'GET':
        try:
            # Получаем клиента, связанного с текущим пользователем
            customer = Customer.objects.get(user=request.user)
            # customer = Customer.objects.get(pk=2)
            serializer = CustomerSerializer(customer)
            return Response(serializer.data)
        except Customer.DoesNotExist:
            return Response({"error": "Customer not found", "user_id": request.user.id}, status=404)

    elif request.method == 'POST':
        import logging
        logger = logging.getLogger(__name__)

        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            already_exists = Customer.objects.filter(user=request.user).exists()
            serializer.save(user=request.user, company_email=request.user.email)
            if not already_exists:
                company_name = serializer.validated_data.get('new_company_name')
                logger.info(f"New customer being created for user {request.user.id}, sending async task for company {company_name}")
                transaction.on_commit(lambda: send_new_customer_task.delay(company_name))
                logger.info("send_new_customer_task.delay() was scheduled.")
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'PUT':
        try:
            customer = Customer.objects.get(user=request.user)
            serializer = CustomerSerializer(customer, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                if serializer.instance.change_data:
                    send_email_change_customer_task.delay(
                        serializer.instance.rp_client_external_id,
                        serializer.instance.company_name
                    )
                    transaction.on_commit(lambda: send_new_customer_task.delay(serializer.instance.company_name))
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
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


class DownloadDocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, filename):
        try:
            filename = urlparse(filename).path.split('/')[-1]
            # Находим документ
            document = CustomerDocuments.objects.get(file__icontains=filename)
            download_name = document.file.name.split("/")[-1]

            # Проверка прав: владелец или админ
            if document.customer.user != request.user and not request.user.is_staff:
                return HttpResponse(status=403)

            # Получение из minio
            s3 = boto3.client(
                "s3",
                endpoint_url=settings.AWS_S3_ENDPOINT_URL,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME,
            )
            print("document.file.name:", document.file.name)
            key = document.file.name  # это путь к файлу в MinIO
            obj = s3.get_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=key)
            response = HttpResponse(obj["Body"].read(), content_type=obj["ContentType"])
            response["Content-Disposition"] = f'attachment; filename="{quote(download_name)}"; filename*=UTF-8\'\'{quote(download_name)}'
            return response

        except CustomerDocuments.DoesNotExist:
            raise Http404("Document not found")
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)


class DownloadAnyDocumentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, filename):
        from urllib.parse import urlparse
        filename = urlparse(filename).path.split('/')[-1]

        try:
            # Попробовать найти файл среди customer documents
            document = CustomerDocuments.objects.filter(file__icontains=filename).first()
            if not document:
                # Попробовать найти файл среди report files
                document = ReportFile.objects.filter(file__icontains=filename).first()
                if not document:
                    return Response({"error": "File not found"}, status=404)

            # Проверка доступа
            if isinstance(document, CustomerDocuments):
                is_owner = document.customer.user == request.user
            else:  # ReportFile
                is_owner = document.report.customer.user == request.user

            if not is_owner and not request.user.is_staff:
                return Response({"error": "Forbidden"}, status=403)

            key = document.file.name
            download_name = getattr(document, 'original_name', None) or key.split("/")[-1]

            s3 = boto3.client(
                "s3",
                endpoint_url=settings.AWS_S3_ENDPOINT_URL,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME,
            )

            obj = s3.get_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=key)
            response = HttpResponse(obj["Body"].read(), content_type=obj["ContentType"])
            response["Content-Disposition"] = f'attachment; filename="{quote(download_name)}"; filename*=UTF-8\'\'{quote(download_name)}'
            return response

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)
