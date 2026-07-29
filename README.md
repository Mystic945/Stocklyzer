# Stocklyzer

An AI-assisted stock portfolio builder. Track holdings and gain/loss across multiple
portfolios, see risk and diversification analytics (volatility, Sharpe ratio, beta,
sector concentration, correlation), and generate plain-language portfolio commentary
powered by Claude.

Stocklyzer is a **portfolio tracker + analytics layer**, not a price predictor — it
doesn't forecast future stock prices or give buy/sell recommendations.

---

## Table of contents

1. [Stack](#stack)
2. [Project structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Step 1 — Get a PostgreSQL database](#step-1--get-a-postgresql-database)
5. [Step 2 — Get a Google OAuth Client ID](#step-2--get-a-google-oauth-client-id)
6. [Step 3 — Get an Anthropic API key](#step-3--get-an-anthropic-api-key)
7. [Step 4 — Run the backend locally](#step-4--run-the-backend-locally)
8. [Step 5 — Run the frontend locally](#step-5--run-the-frontend-locally)
9. [Step 6 — Try it out](#step-6--try-it-out)
10. [Step 7 — Deploy the backend to Render](#step-7--deploy-the-backend-to-render)
11. [Step 8 — Deploy the frontend to Vercel](#step-8--deploy-the-frontend-to-vercel)
12. [Step 9 — Connect the two in production](#step-9--connect-the-two-in-production)
13. [How the analytics work](#how-the-analytics-work)
14. [Troubleshooting](#troubleshooting)

---

## Stack

| Layer         | Technology                              |
|---------------|------------------------------------------|
| Frontend      | React (Vite) → deployed on Vercel        |
| Backend       | FastAPI (Python) → deployed on Render    |
| Database      | PostgreSQL                               |
| Market data   | yfinance (free, no API key required)     |
| AI insights   | Anthropic Claude API                     |
| Auth          | JWT (email/password) + Google Sign-In    |

## Project structure

```
stocklyzer/
├── backend/                   FastAPI app
│   ├── app/
│   │   ├── main.py            entrypoint, CORS, router wiring
│   │   ├── config.py          env-based settings
│   │   ├── database.py        SQLAlchemy engine/session
│   │   ├── models.py          User, Portfolio, Holding, Transaction
│   │   ├── schemas.py         Pydantic request/response models
│   │   ├── security.py        password hashing, JWT
│   │   ├── dependencies.py    auth dependency, ownership checks
│   │   ├── routers/           auth, portfolios, holdings, analytics, insights
│   │   └── services/          yfinance wrapper, analytics engine, Claude client, Google OAuth
│   ├── requirements.txt
│   ├── render.yaml            Render deployment blueprint
│   └── .env.example
└── frontend/                  React (Vite) app
    ├── src/
    │   ├── pages/              Login, Register, Dashboard, PortfolioDetail
    │   ├── components/         Navbar, tables, modals, risk panel, AI insight card
    │   ├── context/AuthContext.jsx
    │   └── api/client.js       axios instance with JWT interceptor
    ├── vercel.json
    └── .env.example
```

## Prerequisites

Install these before you start:

- **Python 3.11 or newer** — check with `python3 --version`. Get it from
  [python.org](https://www.python.org/downloads/) if needed.
- **Node.js 18 or newer** — check with `node --version`. Get it from
  [nodejs.org](https://nodejs.org/) (the LTS version).
- **Git** (to clone/push the project) — check with `git --version`.
- A code editor (VS Code, etc.) — optional but recommended.

You do **not** need to install PostgreSQL locally if you'd rather use a free hosted
instance — see Step 1, Option B.

---

## Step 1 — Get a PostgreSQL database

You have two options. Option B is faster if you don't want to install anything.

### Option A: Install PostgreSQL locally

**macOS (with Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb stocklyzer
```

**Windows:**
1. Download the installer from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/).
2. Run it, keep the default port `5432`, and set a password for the `postgres` user —
   remember this password.
3. Open **pgAdmin** (installed alongside Postgres) or `psql` and run:
   ```sql
   CREATE DATABASE stocklyzer;
   ```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb stocklyzer
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

Your local connection string will look like:
```
postgresql://postgres:postgres@localhost:5432/stocklyzer
```
(swap in whatever password you set)

### Option B: Free hosted Postgres (no local install)

Either of these gives you a connection string in about a minute, and both have
generous free tiers that work fine for a personal project:

1. **[Neon](https://neon.tech)** — sign up, create a project, copy the connection
   string shown on the dashboard (it already includes `?sslmode=require`).
2. **[Supabase](https://supabase.com)** — sign up, create a project, go to
   **Project Settings → Database → Connection string** and copy the URI (choose
   "Connection pooling" if you're deploying to Render's free tier).

Either way, you'll paste this URL into `DATABASE_URL` in Step 4.

---

## Step 2 — Get a Google OAuth Client ID

This powers the "Sign in with Google" button. You'll use the **same Client ID** on
both the backend and frontend.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (top-left project dropdown → **New Project**) or select an
   existing one.
3. In the left sidebar, go to **APIs & Services → Credentials**.
4. Click **Create Credentials → OAuth client ID**.
   - If prompted to configure a consent screen first: choose **External**, fill in
     an app name, your email as support/developer contact, and save. You can leave
     scopes and test users as default for personal use.
5. Back on the Credentials page, click **Create Credentials → OAuth client ID** again:
   - **Application type:** Web application
   - **Name:** anything, e.g. "Stocklyzer"
   - **Authorized JavaScript origins:** add
     - `http://localhost:5173` (for local dev)
     - your Vercel URL once you have it, e.g. `https://stocklyzer.vercel.app`
       (you can add this later and edit the client, so don't worry if you don't
       have it yet)
   - **Authorized redirect URIs:** leave empty — this app uses Google Identity
     Services' token flow, which doesn't need a redirect URI.
6. Click **Create**. Copy the **Client ID** shown (it ends in
   `.apps.googleusercontent.com`) — you'll paste it into both `.env` files.

You can skip this step for now and come back later — email/password login works
without it; the Google button just won't function until `VITE_GOOGLE_CLIENT_ID` is set.

---

## Step 3 — Get an Anthropic API key

This powers the "AI insight" tab (Claude-generated portfolio commentary).

1. Go to [console.anthropic.com](https://console.anthropic.com/) and sign up or log in.
2. In the left sidebar, click **API Keys**.
3. Click **Create Key**, give it a name (e.g. "stocklyzer-backend"), and copy the
   key immediately — it's only shown once. It starts with `sk-ant-`.
4. You'll likely need to add billing details (**Settings → Billing**) to activate
   API access, even for light personal use.
5. Paste the key into `backend/.env` as `ANTHROPIC_API_KEY`. This key is used
   **only server-side** — the frontend never sees it.

You can skip this step too if you just want the tracker/analytics without the AI
tab for now; every other feature works without it.

---

## Step 4 — Run the backend locally

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate          # Windows (Command Prompt): venv\Scripts\activate.bat
                                   # Windows (PowerShell):     venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create your local env file
cp .env.example .env               # Windows: copy .env.example .env
```

Now open `backend/.env` in your editor and fill in:

```ini
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/stocklyzer   # from Step 1
JWT_SECRET=                                                             # see below
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com              # from Step 2 (optional for now)
ANTHROPIC_API_KEY=sk-ant-...                                            # from Step 3 (optional for now)
ANTHROPIC_MODEL=claude-sonnet-4-6
FRONTEND_ORIGIN=http://localhost:5173
```

Generate a random `JWT_SECRET` with:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```
Paste the output in as `JWT_SECRET`.

Start the server:
```bash
uvicorn app.main:app --reload --port 8000
```

You should see `Application startup complete.` in the terminal. Database tables are
created automatically the first time it runs.

Verify it's working by opening **http://localhost:8000/docs** — you should see the
interactive Swagger API docs, and **http://localhost:8000/api/health** should return
`{"status": "ok", "service": "stocklyzer-api"}`.

Leave this terminal running.

---

## Step 5 — Run the frontend locally

Open a **new terminal tab/window** (keep the backend running in the first one):

```bash
cd frontend
npm install
cp .env.example .env                # Windows: copy .env.example .env
```

Open `frontend/.env` and fill in:

```ini
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com   # same as backend, from Step 2
```

Start the dev server:
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Step 6 — Try it out

1. Click **Create one** to register a new account with your email, name, and a
   password (8+ characters) — or use the Google button if you set that up.
2. Click **+ New portfolio**, give it a name (e.g. "Long-term growth"), and create it.
3. Open the portfolio, click **+ Add holding**, and enter a real ticker symbol
   (e.g. `AAPL`, `MSFT`, `RELIANCE.NS` for NSE-listed stocks), a quantity, and your
   average cost per share.
4. The **Holdings** tab shows live price, day change, market value, and gain/loss.
5. The **Risk & diversification** tab shows volatility, Sharpe ratio, beta, a
   diversification score, sector allocation, and your largest positions. This can
   take a few seconds the first time, since it pulls a year of price history per
   ticker.
6. The **AI insight** tab has a **Generate insight** button that sends your
   portfolio's computed metrics to Claude and returns a plain-language summary
   (only if you set `ANTHROPIC_API_KEY`).

---

## Step 7 — Deploy the backend to Render

1. Push this project to a GitHub repository (if you haven't already):
   ```bash
   cd stocklyzer
   git init
   git add .
   git commit -m "Initial Stocklyzer commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/stocklyzer.git
   git push -u origin main
   ```
2. Go to [dashboard.render.com](https://dashboard.render.com/) and sign up/log in
   (GitHub sign-in is easiest).
3. Click **New → Blueprint**.
4. Connect your GitHub account if prompted, then select your `stocklyzer` repo.
5. Render will detect `backend/render.yaml` and show a plan: one **web service**
   (`stocklyzer-api`) and one **free PostgreSQL database** (`stocklyzer-db`). Click
   **Apply**.
   - If Render asks for a root directory, set it to `backend`.
6. Render will prompt you for the env vars marked `sync: false` in the blueprint:
   - `GOOGLE_CLIENT_ID` — paste from Step 2
   - `ANTHROPIC_API_KEY` — paste from Step 3
   - `FRONTEND_ORIGIN` — you can set this to `http://localhost:5173` for now and
     update it once you have your Vercel URL in Step 9
   (`DATABASE_URL` and `JWT_SECRET` are generated automatically by the blueprint.)
7. Click **Create Web Service** / **Deploy**. The first build takes a few minutes —
   watch the logs for `Application startup complete.`
8. Once deployed, Render gives you a URL like
   `https://stocklyzer-api.onrender.com`. Test it by visiting
   `https://stocklyzer-api.onrender.com/api/health`.

> Free-tier Render web services spin down after inactivity and take ~30-60 seconds
> to wake up on the next request — that's normal, not a bug.

---

## Step 8 — Deploy the frontend to Vercel

1. Go to [vercel.com](https://vercel.com/) and sign up/log in with GitHub.
2. Click **Add New → Project**, and import your `stocklyzer` GitHub repo.
3. When configuring the project:
   - **Root Directory:** click Edit and select `frontend`
   - **Framework Preset:** Vite (should be auto-detected)
   - **Build Command / Output Directory:** leave as Vite defaults
     (`npm run build` / `dist`)
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = your Render backend URL from Step 7 (e.g.
     `https://stocklyzer-api.onrender.com`)
   - `VITE_GOOGLE_CLIENT_ID` = your Google Client ID from Step 2
5. Click **Deploy**. After a minute or two you'll get a URL like
   `https://stocklyzer.vercel.app`.

---

## Step 9 — Connect the two in production

A few loose ends to tie together once both are live:

1. **Update CORS on the backend:** in the Render dashboard, go to your
   `stocklyzer-api` service → **Environment**, and set `FRONTEND_ORIGIN` to your
   real Vercel URL (e.g. `https://stocklyzer.vercel.app`). Save — Render will
   redeploy automatically.
2. **Update Google's authorized origins:** back in Google Cloud Console →
   Credentials → your OAuth client, add your Vercel URL to **Authorized JavaScript
   origins**, and save.
3. Reload your Vercel-hosted site and confirm you can register/log in, create a
   portfolio, and add a holding — this confirms the frontend is talking to the
   deployed backend successfully.

---

## How the analytics work

- **Volatility** — annualized standard deviation of daily portfolio returns over the
  trailing year, weighted by current position sizes.
- **Sharpe ratio** — (annualized return − risk-free rate) ÷ volatility. The
  risk-free rate is a fixed approximation (`4.5%`) set in
  `backend/app/services/analytics_engine.py` — adjust the `RISK_FREE_RATE_ANNUAL`
  constant if you want to track the current T-bill rate more precisely.
- **Beta** — covariance of portfolio daily returns with the S&P 500 (`^GSPC`),
  divided by the benchmark's variance.
- **Diversification score** — a 0–100 heuristic combining position concentration
  (inverse Herfindahl index), number of holdings, and number of distinct sectors.
  It's a rule-of-thumb indicator, not a formal risk model.
- **AI insight** — sends the already-computed summary/risk JSON (not raw market
  data from Claude's own knowledge) to Claude, which is instructed in
  `backend/app/services/ai_insights.py` to describe the numbers plainly and
  explicitly avoid buy/sell recommendations or price predictions.

yfinance can occasionally rate-limit or return incomplete data for illiquid or
non-US tickers. The market data service (`backend/app/services/market_data.py`)
caches quotes for 60 seconds and price history for 30 minutes to reduce load.

---

## Troubleshooting

**`uvicorn` fails with a database connection error**
Double-check `DATABASE_URL` in `backend/.env`. If using local Postgres, confirm the
server is running (`pg_isready` or `brew services list` on macOS). If using
Neon/Supabase, make sure you copied the full connection string including
`?sslmode=require` if present.

**Frontend shows a blank page or network errors in the console**
Confirm the backend is running and `VITE_API_URL` in `frontend/.env` points to it
exactly (including `http://` and the port). Restart `npm run dev` after changing
`.env` — Vite only reads env files on startup.

**"Google sign-in failed" or the Google button doesn't appear**
- Make sure `VITE_GOOGLE_CLIENT_ID` is set and you restarted `npm run dev` after
  adding it.
- Make sure the origin you're testing from (e.g. `http://localhost:5173`) is listed
  under Authorized JavaScript origins on the Google OAuth client.

**AI insight tab returns an error**
Confirm `ANTHROPIC_API_KEY` is set in `backend/.env` (local) or in the Render
environment variables (production), and that billing is active on your Anthropic
account.

**A ticker won't add / shows no price data**
yfinance uses exchange-specific suffixes for non-US tickers — e.g. `.NS` for NSE
(India), `.BO` for BSE, `.L` for London. Try the ticker on
[finance.yahoo.com](https://finance.yahoo.com) first to confirm the exact symbol
yfinance expects.

**Render free-tier service is slow to respond**
This is expected — free services spin down after ~15 minutes of inactivity and
take under a minute to wake back up on the next request.
