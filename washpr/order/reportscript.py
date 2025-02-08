from datetime import datetime, timedelta
from django.db import transaction
from .models import Order
from .models import OrderReport

def generate_monthly_reports():
    today = datetime.today()
    first_day_last_month = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
    last_day_last_month = today.replace(day=1) - timedelta(days=1)

    users = Order.objects.filter(
        created_at__date__range=[first_day_last_month, last_day_last_month],
        reported=False
    ).values_list("user", flat=True).distinct()

    for user_id in users:
        orders = Order.objects.filter(
            user_id=user_id,
            created_at__date__range=[first_day_last_month, last_day_last_month],
            reported=False
        )

        if not orders.exists():
            continue  # Если нет заказов, пропускаем

        with transaction.atomic():
            report, created = OrderReport.objects.get_or_create(
                user_id=user_id,
                report_month=first_day_last_month
            )
            report.orders.add(*orders)  # Добавляем все заказы
            orders.update(reported=True)  # Отмечаем их как обработанные

    print("✅ Monthly reports updated successfully!")

# cron
# 0 0 1 * * /path/to/venv/bin/python /path/to/manage.py shell -c "from reports.tasks import generate_monthly_reports; generate_monthly_reports()"

# from celery import shared_task
# from reports.tasks import generate_monthly_reports
#
# @shared_task
# def run_monthly_report():
#     generate_monthly_reports()

# from celery.schedules import crontab
#
# CELERY_BEAT_SCHEDULE = {
#     "generate_reports_monthly": {
#         "task": "reports.tasks.run_monthly_report",
#         "schedule": crontab(minute=0, hour=0, day_of_month=1),
#     },
# }
