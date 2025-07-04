from django.contrib import admin
from django.urls import path, include, re_path
from .import views
from .views import *

urlpatterns = [
    path('api/', landing_page, name='land_page'),
    path('api/landing/', landing_page_view, name='landing_page'),
    path('api/contacts/send-email/', send_contact_email, name='send_contact_email'),
]
