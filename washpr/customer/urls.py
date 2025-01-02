from django.urls import path
from .views import customer_view

urlpatterns = [
    path('data/', customer_view, name='customer_view'),
]
