#!/bin/sh
set -e

echo "Checking for model changes..."

if ! python manage.py makemigrations --dry-run --check; then
  echo "Found changes, making migrations..."

  echo "Apply database make migrations"
  python manage.py makemigrations accounts
  python manage.py migrate
  python manage.py makemigrations customer
  python manage.py makemigrations place
  python manage.py makemigrations order
  python manage.py makemigrations landing
  python manage.py makemigrations

else
  echo "No changes detected, skipping makemigrations."
fi

echo "Checking for unapplied migrations..."

if python manage.py showmigrations --plan | grep '\[ \]'; then
  echo "Applying migrations..."
  python manage.py migrate --noinput
  python manage.py migrate django_celery_beat
else
  echo "No unapplied migrations, skipping migrate."
fi

echo "Install default data"
python manage.py loaddata landing.json

echo "Collect static files"
python manage.py collectstatic --noinput

echo "Starting server..."
exec "$@"
