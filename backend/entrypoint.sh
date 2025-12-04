#!/bin/bash
set -e

# Ждём, пока БД поднимется
until pg_isready -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "Applying migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn..."
gunicorn --bind 0.0.0.0:8000 kittygram.wsgi:application