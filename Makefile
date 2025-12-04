.PHONY: help install check-node check-npm dev dev-db dev-backend dev-frontend migrate superuser test clean

# Копируем .env.example → .env (если .env ещё нет)
copy-env:
	@if [ ! -f .env ]; then \
		echo "Создаём .env из .env.example"; \
		cp .env.example .env; \
	else \
		echo ".env уже существует — оставляем как есть"; \
	fi

db: copy-env
	@echo "Запускаем PostgreSQL из .env (или .env.example)..."
	@set -a && . ./.env 2>/dev/null || . ./.env.example && set +a; \
	docker run -d --name kittygram_dev_db \
		-e POSTGRES_USER=$$POSTGRES_USER \
		-e POSTGRES_PASSWORD=$$POSTGRES_PASSWORD \
		-e POSTGRES_DB=$$POSTGRES_DB \
		-p 5432:5432 \
		-v kittygram_dev_pgdata:/var/lib/postgresql/data \
		postgres:15 || true
	@echo "Ждём готовности БД..."
	@sleep 6
