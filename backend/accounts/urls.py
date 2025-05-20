from django.urls import path
from .views import RegisterView, AccountDataView, ActivateAccountView, api_password_reset, api_password_reset_confirm, \
    api_password_reset_complete


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('activate/', ActivateAccountView.as_view(), name='api_activate_account'),
    path('data/', AccountDataView.as_view(), name='account_data'),
    path('password-reset/', api_password_reset, name='api_password_reset'),
    # Эндпоинт для подтверждения сброса пароля (GET для редиректа и POST для смены пароля)
    path('reset/<uidb64>/<token>/', api_password_reset_confirm, name='password_reset_confirm'),
    # Эндпоинт завершения сброса пароля (для редиректа после успешного сброса)
    path('reset/done/', api_password_reset_complete, name='password_reset_complete'),
]
