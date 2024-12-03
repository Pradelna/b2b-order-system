from django.contrib import admin
from django.urls import path, include, re_path
from .import views
from .views import *

urlpatterns = [
    path('', landing_page, name='landing_page'),
    path('land/', LandingView.as_view(), name='menu_page'),
]
