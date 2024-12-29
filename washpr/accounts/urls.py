from django.urls import path
from .views import RegisterView, api_activate_account

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('activate/', api_activate_account, name='api_activate_account'),
]
