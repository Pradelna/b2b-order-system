from rest_framework.pagination import LimitOffsetPagination

class CustomPagination(LimitOffsetPagination):
    default_limit = 50  # Устанавливаем дефолт в 50
    max_limit = 100