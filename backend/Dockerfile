FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Установка Python-зависимостей
COPY ./backend/requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Копируем проект
COPY ./backend .

# Сбор статики (выполнится при старте через entrypoint)
RUN mkdir -p /app/static /app/media

# Копируем entrypoint
COPY ./backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]