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

if [ "$1" = "flower" ]; then
  echo "Starting Flower..."
  exec python -m flower --broker=redis://redis:6379/0 --port=5555 --loglevel=info --log-file-prefix=/logs/flower.log
fi

exec "$@"
