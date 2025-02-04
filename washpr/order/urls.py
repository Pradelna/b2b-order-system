from django.urls import path
from .views import create_order, get_place_orders, get_orders, update_order


urlpatterns = [
    path('create/', create_order, name='create_order'),
    path('<int:place_id>/orders/', get_place_orders, name='get_place_orders'),
    path('list/', get_orders, name='get_orders'),
    path('update/<int:order_id>/', update_order, name='update_order'),
]
