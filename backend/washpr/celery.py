import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')


app.conf.beat_schedule = {
    'send-orders-every-hour': {
        'task': 'integration.tasks.send_orders_task',
        'schedule': crontab(minute='5,15,25,36,45,55', hour='4-23'),
    },
    'create-orders-every-hour': {
        'task': 'integration.tasks.create_orders_task',
        'schedule': crontab(minute='0,7,12,17,22,28,31,34,40,47,52,57', hour='4-23'),
    },
    'update-orders-every-hour': {
        'task': 'integration.tasks.update_orders_task',
        'schedule': crontab(minute='2,33', hour='4-23'),
    },
    'update-photos-every-hour': {
        'task': 'integration.tasks.check_file_in_orders_task',
        'schedule': crontab(minute='10', hour='4-23'),
    },
    "generate_monthly_reports": {
        "task": "integration.tasks.generate_monthly_reports_task",
        "schedule": crontab(day_of_month=1, hour=4, minute=0),
        # Запустится 1-го числа каждого месяца в 04:00
    },
}
