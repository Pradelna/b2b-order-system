from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings

class MinioMediaStorage(S3Boto3Storage):
    # bucket_name = "washservice"
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    custom_domain = False
