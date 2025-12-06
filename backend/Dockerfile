FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*


COPY requirements.txt .

RUN pip install -r requirements.txt --no-cache-dir


COPY . .
# COPY wait-for-db.sh /wait-for-db.sh
# RUN chmod +x /wait-for-db.sh
# RUN sh /wait-for-db.sh
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]