#!/bin/sh

echo "Apply database make migrations"
python manage.py makemigrations accounts
python manage.py migrate
python manage.py makemigrations customer
python manage.py makemigrations place
python manage.py makemigrations order
python manage.py makemigrations landing
python manage.py makemigrations

echo "Apply database migrations"
python manage.py migrate --noinput
python manage.py migrate django_celery_beat

echo "Install default data"
python manage.py loaddata landing.json

echo "Collect static files"
python manage.py collectstatic --noinput

echo "Starting server..."

exec "$@"
