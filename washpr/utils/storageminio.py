from storages.backends.s3boto3 import S3Boto3Storage

class MinioMediaStorage(S3Boto3Storage):
    bucket_name = "washservice"
    custom_domain = False
