#!/bin/sh
set -e

host="$DB_HOST"
port="$DB_PORT"

until nc -z "$host" "$port"; do
  echo "Waiting for database..."
  sleep 1
done

echo "Database is up!"

echo "Применяем миграции..."
python manage.py migrate --noinput

echo "Собираем статику..."
python manage.py collectstatic --noinput

echo "Запускаем Gunicorn..."
exec gunicorn --bind 0.0.0.0:8000 kittygram_backend.wsgi:application