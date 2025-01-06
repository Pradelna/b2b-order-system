from django.urls import path
from .views import customer_view, customer_detail_view

urlpatterns = [
    path('data/', customer_view, name='customer_view'),
    path('<int:customer_id>/', customer_detail_view),
]
