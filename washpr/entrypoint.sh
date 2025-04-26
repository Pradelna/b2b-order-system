#!/bin/sh

echo "Apply database make migrations"
python manage.py makemigrations accounts
python manage.py migrate accounts
python manage.py makemigrations customer
python manage.py migrate customer
python manage.py makemigrations place
python manage.py migrate place
python manage.py makemigrations order
python manage.py migrate order
python manage.py makemigrations landing
python manage.py migrate landing

echo "Apply database migrations"
python manage.py migrate --noinput
python manage.py migrate django_celery_beat

echo "Install default data"
if python manage.py loaddata landing.json; then
  echo "Default data loaded successfully."
else
  echo "Warning: Failed to load landing.json. Continuing without aborting."
fi

echo "Collect static files"
python manage.py collectstatic --noinput

echo "Starting server..."

exec "$@"
