#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/var/www/financemanager
NGINX_CONF=/etc/nginx/sites-enabled/financemanager

echo "==> Creating app directory"
mkdir -p "$APP_DIR"

echo "==> Creating Python venv"
python3 -m venv "$APP_DIR/venv"
"$APP_DIR/venv/bin/pip" install --upgrade pip

echo "==> Installing backend dependencies"
"$APP_DIR/venv/bin/pip" install -r "$APP_DIR/backend/requirements.txt"

echo "==> Creating PostgreSQL database"
sudo -u postgres psql -c "CREATE USER finuser WITH PASSWORD 'changeme' LOGIN;" || true
sudo -u postgres psql -c "CREATE DATABASE financemanager OWNER finuser;" || true

echo "==> Installing nginx site config"
cp "$APP_DIR/nginx/financemanager-site.conf" "$NGINX_CONF"
nginx -t
systemctl reload nginx

echo "==> Installing systemd service"
cp "$APP_DIR/deploy/financemanager.service" /etc/systemd/system/financemanager.service
systemctl daemon-reload
systemctl enable financemanager

echo ""
echo "Setup complete. Next steps:"
echo "  1. Copy .env.example to /var/www/financemanager/.env and fill in values"
echo "  2. Generate SECRET_KEY: python3 -c \"import secrets; print(secrets.token_hex(32))\""
echo "  3. Generate password hash: python3 -c \"from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('yourpassword'))\""
echo "  4. Run: systemctl start financemanager"
