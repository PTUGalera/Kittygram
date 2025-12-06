# Kittygram

Приложение Kittygram — проект (backend на Django + DRF, frontend на React), демонстрирующий работу с REST API, аутентификацию и развёртывание через Docker Compose.

## Коротко
- Backend: Django, Django REST Framework, Djoser (token auth).
- Frontend: React (create-react-app).
- Оркестрация: `docker-compose` (сервис `gateway` (nginx), `backend`, `frontend`, `db`).

## Быстрый старт с Docker (рекомендуется)
1. Убедитесь, что у вас установлен Docker и Docker Compose.
2. В корне проекта запустите:

```bash
docker-compose up --build
```

3. После сборки сервисы станут доступны:
- Веб-интерфейс (frontend + gateway): http://localhost:9000
- API (через gateway): http://localhost:9000/api/

4. Логи:

```bash
docker-compose logs -f backend    # лог бэкенда
docker-compose logs -f gateway    # nginx / проксирование
docker-compose logs -f frontend   # фронтенд
```

Если нужно пересобрать заново:

```bash
docker-compose up --build --force-recreate
```

## Локальная разработка (через Python venv)
Если вы хотите запускать backend локально (без Docker), рекомендуется использовать `pyenv` + виртуальное окружение.

1. Установите Python 3.10.11 через `pyenv` (если ещё не установлен):

```bash
# проверить pyenv
pyenv --version
# установить Python 3.10.11 (если нужно)
pyenv install 3.10.11
# создать виртуальное окружение (pyenv-virtualenv) или использовать .venv
pyenv virtualenv 3.10.11 kittygram-3.10.11
pyenv local kittygram-3.10.11
# либо
pyenv shell 3.10.11
python -m venv .venv
source .venv/bin/activate
```

2. Установите зависимости для backend:

```bash
source .venv/bin/activate
pip install -r backend/requirements.txt
```

3. Настройте переменные окружения (опционально):
- Для локальной разработки можно использовать `.env` или экспортировать необходимые переменные (например, `DJANGO_DEBUG`, `DATABASE_URL` и т.п.), но в этом репозитории по умолчанию используется конфигурация docker-compose.

4. Примените миграции и создайте суперпользователя:

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
python manage.py runserver
```

Frontend (локально):

```bash
cd frontend
npm ci
npm start
# production build
npm run build
```

## Авторизация / токены
- Приложение использует token-аутентификацию (Djoser + DRF authtoken). При логине frontend получает `auth_token` и сохраняет его в `localStorage` под ключом `auth_token`.
- Для API-запросов заголовок должен быть: `Authorization: Token <auth_token>`.

## Структура репозитория (основное)
- `backend/` — Django-приложение, модель `cats`, сериализаторы, миграции.
- `frontend/` — React-приложение.
- `docker-compose.yml` — описывает сервисы для локального запуска.

## Полезные команды
- Сборка и старт контейнеров: `docker-compose up --build`
- Остановка: `docker-compose down`
- Рестарт одного сервиса: `docker-compose up -d --build backend`
- Выполнение команд внутри сервиса backend: `docker-compose exec backend python manage.py <cmd>`

## Отладка распространённых проблем
- Если backend падает при старте — смотрите `docker-compose logs backend` и ищите Traceback. Частая причина — ошибки в импортируемых файлах (например, не импортированная константа/permission).
- Если nginx возвращает 502 — проверьте, поднят ли backend и доступен ли на порту 8000 внутри сети Docker. Смотрите `docker-compose ps` и `docker-compose logs gateway`.
- Если фронтенд не видит API или появляется двойной `/api/api/` — проверьте `frontend/src/utils/constants.js`, там настроена базовая часть URL (`/api`).

## Вклад и работа с Git
- Ветки защищены: изменения в `main` создаются через Pull Request. Создавайте feature-ветки, делайте PR и проходите ревью.
- Рекомендуемый workflow:

```bash
git checkout -b feature/your-feature
# вносите изменения
git add -A
git commit -m "feat: описание"
git push origin feature/your-feature
# создать PR в GitHub
```

## Тесты
- Запуск тестов (в контейнере backend):

```bash
docker-compose exec backend pytest
```

## Лицензия
Проект распространяется без лицензии в репозитории. Добавьте `LICENSE`, если хотите указать лицензионные условия.