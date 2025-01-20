from django.urls import path
from .views import create_order, get_place_orders, get_orders


urlpatterns = [
    path('create/', create_order, name='create_order'),
    path('<int:place_id>/orders/', get_place_orders, name='create_order'),
    path('list/', get_orders, name='get_orders'),
]
