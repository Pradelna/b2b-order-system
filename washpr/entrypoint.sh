#!/bin/sh

echo "Apply database migrations"
python manage.py migrate --noinput

echo "Install default data"
python manage.py loaddata landing.json

echo "Collect static files"
python manage.py collectstatic --noinput

echo "Starting server..."
exec "$@"