FROM node:22-bookworm-slim AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
RUN npm ci
COPY frontend ./frontend
RUN npm run build

FROM python:3.14.8-slim-bookworm
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY backend/requirements*.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements-deploy.txt && pip check
COPY backend ./backend
COPY --from=frontend /app/frontend/dist ./frontend/dist
COPY scripts/render-start.sh ./scripts/render-start.sh
# Collect admin assets without any deployment secrets or database connection.
RUN DJANGO_SETTINGS_MODULE=config.settings DJANGO_SECRET_KEY=build-assets-only-not-a-runtime-secret DJANGO_USE_SQLITE=true python backend/manage.py collectstatic --noinput
RUN useradd --uid 10001 --create-home appuser
USER appuser
EXPOSE 10000
CMD ["sh", "/app/scripts/render-start.sh"]
