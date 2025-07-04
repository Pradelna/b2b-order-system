import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'washpr.settings')

app = Celery('washpr')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')


app.conf.beat_schedule = {
    'send-orders-every-hour': {
        'task': 'integration.tasks.send_orders_task',
        # 'schedule': crontab(minute=0, hour='4-23'),
        'schedule': crontab(minute='*/2'),
    },
    'create-orders-every-hour': {
        'task': 'integration.tasks.create_orders_task',
        # 'schedule': crontab(minute=0, hour='4-23'),
        'schedule': crontab(minute='*/2'),
    },
    'update-orders-every-hour': {
        'task': 'integration.tasks.update_orders_task',
        # 'schedule': crontab(minute=0, hour='4-23'),
        'schedule': crontab(minute='*/2'),
    },
    'update-photos-every-hour': {
        'task': 'integration.tasks.check_file_in_orders_task',
        # 'schedule': crontab(minute=0, hour='4-23'),
        'schedule': crontab(minute='*/1'),
    },
    "generate_monthly_reports": {
        "task": "integration.tasks.generate_monthly_reports_task",
        "schedule": crontab(day_of_month=1, hour=1, minute=0),
        # Запустится 1-го числа каждого месяца в 01:00
    },
}
