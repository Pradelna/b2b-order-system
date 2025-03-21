from django.urls import path
from .views import *


urlpatterns = [
    path('is-admin/', check_is_admin, name='check_is_admin'),
    path('customers/total/', total_customers, name='total_customers'),
    path('orders/total/', total_orders, name='total_orders'),
    path('customers/new/', new_customers, name='new_customers'),
    path('customer/detail/<int:customer_id>/', customer_details, name='customer_details'),
    path('customer-place/list/<int:customer_id>/', customers_places, name='customers_places'),
    path('customer/put/<int:customer_id>/', put_customer, name='put_customer'),
    path('customer/documents/<int:customer_id>/', upload_document, name='upload_document'),
    path('customer/documents/list/<int:customer_id>/', list_customer_documents_admin, name='list_customer_documents'),
    path('customer/documents/for-customer/<int:customer_id>/', list_documents_for_customer_admin, name='list_documents_for_customer_admin'),
    path('customer/documents/<int:file_id>/delete/<int:customer_id>/', delete_document_admin, name='delete_document_admin'),
    path('place-detail/<int:place_id>/', get_place_detail_admin, name='get_place_detail_admin'),
    path('order/photos/<int:place_id>/', get_photo_reports_admin, name='get_photo_reports_admin'),
    path('all-photos/<int:customer_id>/', get_all_photo_reports_admin, name='get_all_photo_reports_admin'),
    path('user-orders/<int:customer_id>/', get_user_orders_admin, name='get_user_orders_admin'),
]