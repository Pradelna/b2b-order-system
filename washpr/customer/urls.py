from django.urls import path
from .views import *

urlpatterns = [
    path('data/', customer_view, name='customer_view'),
    path('user/', customer_user_view, name='customer_user_view'),
    # path('<int:customer_id>/', customer_detail_view),
    path('documents/upload/', upload_document, name='upload_document'),
    path('documents/', list_customer_documents, name='list_customer_documents'),
    path('documents/for-customer/', list_documents_for_customer, name='list_documents_for_customer'),
    path('documents/<int:file_id>/delete/', delete_document, name='delete_document'),
]
