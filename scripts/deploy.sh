#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/var/www/financemanager
VENV="$APP_DIR/venv/bin"

echo "==> Pulling latest code"
cd "$APP_DIR"
git pull origin main

echo "==> Installing backend dependencies"
"$VENV/pip" install -q -r backend/requirements.txt

echo "==> Running database migrations"
cd "$APP_DIR/backend"
"$VENV/alembic" upgrade head

echo "==> Building frontend"
cd "$APP_DIR/frontend"
npm ci --silent
npm run build

echo "==> Restarting service"
systemctl restart financemanager
systemctl is-active --quiet financemanager && echo "Service is running" || (journalctl -u financemanager -n 30 && exit 1)

echo "==> Deploy complete"
