from django.urls import path
from .views import create_order, get_place_orders, get_orders, update_order, UserReportListView, UserReportDetailView, \
    GenerateMonthlyReport, get_all_orders

urlpatterns = [
    path('create/', create_order, name='create_order'),
    path('<int:place_id>/orders/', get_place_orders, name='get_place_orders'),
    # path('<int:place_id>/orders-pl/', get_place_orders_temp, name='get_place_orderspl'),
    path('<int:place_id>/orders/', get_place_orders, name='get_place_orders'),
    path('list/', get_orders, name='get_orders'),
    path('all-orders/', get_all_orders, name='get_all_orders'),
    path('update/<int:order_id>/', update_order, name='update_order'),

    path("reports/", UserReportListView.as_view(), name="user-reports"),
    path("reports/<int:pk>/", UserReportDetailView.as_view(), name="report-detail"),
    path("reports/generate/", GenerateMonthlyReport.as_view(), name="generate-report"),
]
