from django.urls import path
from .views import customer_view, customer_detail_view, upload_document, list_customer_documents

urlpatterns = [
    path('data/', customer_view, name='customer_view'),
    path('<int:customer_id>/', customer_detail_view),
    path('documents/upload/', upload_document, name='upload_document'),
    path('documents/', list_customer_documents, name='list_customer_documents'),
]
