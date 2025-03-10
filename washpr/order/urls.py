from django.urls import path

from .models import PhotoReport
from .views import create_order, get_place_orders, get_orders, update_order, UserReportListView, UserReportDetailView, \
    GenerateMonthlyReport, get_all_orders, get_current_order, get_photo_reports_orders, download_file_view

urlpatterns = [
    path('create/', create_order, name='create_order'),
    # path('<int:place_id>/orders/', get_place_orders, name='get_place_orders'),
    path('<int:place_id>/orders/', get_place_orders, name='get_place_orders'),
    path('list/', get_orders, name='get_orders'),
    path('all-orders/', get_all_orders, name='get_all_orders'),
    path('update/<int:order_id>/', update_order, name='update_order'),
    path('check-current-order/', get_current_order, name='get_current_order'),

    path("photos/", get_photo_reports_orders, name="photo-reports"),
    path("photos/download/<int:file_id>/", download_file_view, name="photo-download"),
    path("reports/", UserReportListView.as_view(), name="user-reports"),
    path("reports/<int:pk>/", UserReportDetailView.as_view(), name="report-detail"),
]
