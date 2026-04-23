# Business Finance Manager

A full-stack finance tracking system: Telegram bot (voice + text, Gemini AI) + secure web dashboard (React + FastAPI + PostgreSQL).

---

## Features

**Telegram Bot**
- Voice messages and text commands
- Gemini AI transcribes audio and understands intent in Uzbek, Russian, or English
- Log income and expenses with category, amount, date, and note
- Ask for balance summaries and spending reports
- Delete or correct the last transaction
- Multi-step FSM conversation for category disambiguation

**Web Dashboard**
- JWT-authenticated login (username + password)
- Overview: KPIs, quick-add transaction form, recent activity feed
- Transactions: filter by date/category/type, inline edit and delete
- Analytics: income vs expense charts, category breakdown, AI-powered forecast
- Categories: create, edit, delete with color and icon
- Budgets: set monthly spending limits per category, track progress

---

## Local Development (Windows — no Docker)

### Requirements

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ running locally

### 1 — Clone and configure

```powershell
git clone https://github.com/your-org/BusinessFinanceManager.git
cd BusinessFinanceManager
Copy-Item .env.example backend\.env
```

Edit `backend\.env` — set at minimum:
- `DATABASE_URL` — pointing to your local PostgreSQL
- `TELEGRAM_BOT_TOKEN`
- `GEMINI_API_KEY`
- `SECRET_KEY` — generate with: `python -c "import secrets; print(secrets.token_hex(32))"`
- `DASHBOARD_PASSWORD_HASH` — generate with:
  ```powershell
  cd backend
  .venv\Scripts\python -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('yourpassword'))"
  ```

### 2 — Backend

Open **PowerShell terminal 1**:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Backend API will be at `http://localhost:8000/api/v1/`

### 3 — Frontend

Open **PowerShell terminal 2**:

```powershell
cd frontend
npm install
npm run dev
```

Dashboard will be at `http://localhost:5173`

The Vite dev server proxies `/api/` to `http://localhost:8000` automatically (configured in `vite.config.ts`).

### 4 — Telegram Bot

The bot runs as a background asyncio task alongside the FastAPI app — it starts automatically when uvicorn starts. No separate process needed.

To test bot commands locally, use [ngrok](https://ngrok.com/) or set `WEBHOOK_URL` — or simply start the backend and message your bot on Telegram.

### Default login credentials

- Username: `admin`
- Password: `secret` (**change this** by generating a new hash in `.env`)

---

## VPS Deployment (systemd + Nginx, no Docker)

This setup mirrors the `teacherpro` service pattern on the server. It runs on port **8443 (HTTPS)** and does not conflict with existing services on ports 8000 and 3000.

### First-time server setup

SSH into the VPS, then:

```bash
# Clone repo
git clone https://github.com/your-org/BusinessFinanceManager.git /var/www/financemanager
cd /var/www/financemanager

# Copy and fill .env
cp .env.example .env
nano .env   # fill all values

# Run setup script (as root)
chmod +x scripts/setup.sh
sudo bash scripts/setup.sh
```

The setup script:
1. Creates a Python virtualenv at `/var/www/financemanager/venv`
2. Installs Python dependencies
3. Creates the PostgreSQL user and database
4. Symlinks the nginx site config to `/etc/nginx/sites-enabled/financemanager`
5. Registers and enables the `financemanager` systemd service

### Start the service

```bash
sudo systemctl start financemanager
sudo systemctl status financemanager
```

### Nginx

The site config at `nginx/financemanager-site.conf` listens on **port 8443 (HTTPS)**, reuses the existing SSL cert at `/etc/nginx/ssl/77.42.75.94/`, and serves:
- `/api/` — proxied to the FastAPI unix socket at `/run/financemanager/api.sock`
- `/` — static frontend files from `/var/www/financemanager/frontend/dist/`

No changes are made to existing nginx configs.

### Manual deploy

```bash
sudo bash /var/www/financemanager/scripts/deploy.sh
```

### CI/CD via GitHub Actions

On every push to `main`, the GitHub Actions workflow:
1. SSHes into the VPS
2. Writes `.env` from GitHub Secrets
3. `git reset --hard origin/main`
4. `pip install` backend dependencies
5. `alembic upgrade head`
6. `npm ci && npm run build`
7. `systemctl restart financemanager`

---

## GitHub Secrets Reference

Set these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `HOST` | VPS IP address |
| `USER` | SSH username (e.g. `root`) |
| `SSH_KEY` | Private SSH key for the VPS |
| `PORT` | SSH port (usually `22`) |
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@localhost:5432/dbname` |
| `TELEGRAM_BOT_TOKEN` | From @BotFather |
| `GEMINI_API_KEY` | From Google AI Studio |
| `CORS_ORIGINS` | `["https://77.42.75.94:8443"]` |
| `SECRET_KEY` | Random 64-char hex string |
| `DASHBOARD_USERNAME` | Login username for the dashboard |
| `DASHBOARD_PASSWORD_HASH` | bcrypt hash of the dashboard password |

---

## Project Structure

```
BusinessFinanceManager/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # FastAPI routers (auth, transactions, categories, budgets, analytics, overview)
│   │   ├── bot/             # Telegram bot (aiogram 3, FSM handlers, Gemini NLU)
│   │   ├── core/            # config, auth utilities, database session
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # Business logic layer
│   │   └── main.py          # FastAPI app + asyncio lifespan (bot)
│   ├── alembic/             # Database migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Layout, auth guard, shared UI
│   │   ├── pages/           # Overview, Transactions, Analytics, Categories, Budgets, Login
│   │   ├── lib/             # api.ts (axios), auth.ts (JWT localStorage)
│   │   └── types/           # TypeScript interfaces
│   └── package.json
├── deploy/
│   └── financemanager.service   # systemd unit file
├── nginx/
│   └── financemanager-site.conf # nginx site config (port 8443)
├── scripts/
│   ├── setup.sh             # First-time VPS setup
│   └── deploy.sh            # Deploy script (called by CI or manually)
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions SSH deploy
└── .env.example
```

---

## Bot Usage

| Action | Example message |
|---|---|
| Add expense | `Supermarket 45000 so'm` |
| Add income | `Salary 5,000,000 received` |
| Add with note | `Taxi 15000 airport` |
| Voice | Send a voice message in any supported language |
| Balance | `Balans`, `Остаток`, `Balance` |
| Report | `Hisobot`, `Отчёт`, `Report` |
| Delete last | `O'chir`, `Удали`, `Delete last` |

The bot auto-detects Uzbek, Russian, and English.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI 0.115, Python 3.11 |
| Database | PostgreSQL 15, SQLAlchemy 2.0 async, asyncpg |
| Migrations | Alembic |
| Auth | PyJWT, passlib/bcrypt |
| Telegram Bot | aiogram 3.x, FSM (MemoryStorage) |
| AI | Gemini 2.5 (Flash/Pro) — transcription + NLU |
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Data fetching | TanStack Query v5 |
| Charts | Recharts |
| Routing | React Router v6 |
| Process manager | systemd + gunicorn (UvicornWorker) |
| Web server | Nginx (unix socket proxy + static files) |
| CI/CD | GitHub Actions (SSH deploy) |
