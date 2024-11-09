from django.contrib import admin
from django.urls import path, include, re_path
from .import views
from .views import landing_page

urlpatterns = [
    path('', landing_page, name='landing_page'),
]
