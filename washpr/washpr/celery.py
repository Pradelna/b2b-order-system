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
        'schedule': crontab(minute='*/5'),
    },
}
