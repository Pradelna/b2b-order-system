from django.urls import path
from .views import RegisterView, api_activate_account, AccountDataView, ActivateAccountView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('activate/', ActivateAccountView.as_view(), name='api_activate_account'),
    path('data/', AccountDataView.as_view(), name='account_data'),
]
