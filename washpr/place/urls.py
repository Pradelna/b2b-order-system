from django.urls import path
from .views import create_place, get_list_place, get_place_detail, delete_place


urlpatterns = [
    path('create/', create_place, name='create_place'),
    path('list/', get_list_place, name='get_list_place'),
    path('<int:place_id>/', get_place_detail, name='place_detail'),
    path('delete/<int:place_id>/', delete_place, name='place_detail'),

]
