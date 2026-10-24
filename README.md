# 🪔 Utsavly — GenAI Event Planning Assistant

> **Utsavly** is a production-grade GenAI planning assistant purpose-built for Indian celebrations: **Weddings, Birthdays, and Community Festivals**. Built with an India-first architecture (INR default, regional cultural traditions, contingency cushions, and backward-scheduled muhurat milestones).
> 
> Inspired by the craft of Linear, Stripe, and Notion Calendar — strictly avoiding template AI aesthetics.

---

## ⚡ 3-Command Setup

Get the full stack running locally with seeded demo data in 3 commands:

```bash
# 1. Install backend dependencies and seed database with 3 demo events
pip install -r requirements.txt && python seed.py

# 2. Install frontend dependencies
cd frontend && npm install

# 3. Start development servers
# Terminal A (Backend FastAPI on :8000):
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
# Terminal B (Frontend Vite React on :5173):
cd frontend && npm run dev
```

Visit **http://localhost:5173** to launch Utsavly.

*(Note: Utsavly runs out-of-the-box with deterministic mock engines or with live Gemini by configuring `GEMINI_API_KEY` in `.env`).*

---

## 🎨 Theme & Design System (Section 5 Spec)

- **Default Theme:** Dark theme (near-black `#0B0A10`, surface `#14121C`, electric purple `#7C3AED`, neon yellow CTA `#FACC15`).
- **Light Theme:** Warm cream (`#FFF8EC`, surface `#FFFFFF`, amber CTA `#F59E0B`, warm orange `#EA580C`).
- **Typography:**
  - **Headings:** Plus Jakarta Sans (600/700/800) with tight tracking (`-0.02em`).
  - **Body / UI:** DM Sans (400/500/600).
  - **Numbers / Currency:** `tabular-nums` alignment for financial ledgers and countdowns.
- **Layout & Alignment:**
  - Strict 8px spacing scale (4, 8, 12, 16, 24, 32, 48, 64).
  - Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
  - Desktop: Fixed sidebar (264px) + top bar (64px). Mobile: Bottom navigation bar (56px).
  - Interactive elements: 44px height, 12px border radius, 180ms cubic-bezier transition.

---

## 📸 Screenshots & UI Tour

| View | Theme | Description |
|---|---|---|
| **Landing Hero** | Dark | Bento grid of four pillars, left-aligned hero with real product preview mock. |
| **Landing Hero** | Light | Warm cream palette with amber CTA and high-contrast typography. |
| **Dashboard** | Dark | Countdown, ₹1.2L contingency cushion, milestone progress, and Health Score Index. |
| **Dashboard** | Light | High-contrast amber/orange metric cards with tabular numbers. |
| **AI Budget** | Dark | Recharts category allocation donut, editable ledger, and overspend warnings. |
| **AI Budget** | Light | Clean financial ledger with tabular INR numbers and contingency cushion. |
| **Timeline** | Dark | Backward-planned milestones, Kanban & List views, and date-shift simulator. |
| **Timeline** | Light | Drag-friendly Kanban cards with 4px hover lift. |
| **Vendor Directory** | Dark | Quotes, advance payments, balance tracking, and AI contract clause screening. |
| **Personalized Ideas** | Dark | High-contrast category filter chips and one-click "Add to Plan" budget sync. |
| **Planner Copilot** | Dark | Sandboxed slide-over panel with 3 allowlisted tool actions. |
| **Setup Wizard** | Dark | Modal step-form with 44px inputs, 8px label spacing, and cultural tradition selector. |

---

## 🏛️ System Architecture & Folder Map

```
pw/
├── backend/
│   ├── main.py                 # FastAPI application, CORS, routers initialization
│   ├── config.py               # Pydantic Settings (APP_NAME, GEMINI_API_KEY, AI_MOCK)
│   ├── database.py             # SQLite engine & session management
│   ├── models.py               # SQLAlchemy models (Event, BudgetItem, Task, Vendor, Idea)
│   ├── schemas.py              # Pydantic V2 schemas with strict validations
│   ├── services/
│   │   └── ai_service.py       # Gemini GenAI service + realistic Indian mock generator
│   └── routers/
│       ├── events.py           # Event creation wizard, switcher, date reschedule
│       ├── budget.py           # Budget items CRUD, ledger balance, overspend detector
│       ├── timeline.py         # Task status updates, backward date scheduling
│       ├── vendors.py          # Vendor registry, payments, contract audit modal
│       ├── ideas.py            # Idea generator and "Add to Plan" toggle
│       ├── health.py           # Deterministic 0-100 Event Health Score & Smart Alerts
│       └── copilot.py          # Sandboxed Copilot with 3 allowlisted tool actions
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Fixed 264px desktop sidebar & 56px mobile nav
│   │   │   ├── Header.tsx            # 64px header, event switcher, theme toggle
│   │   │   ├── LandingPage.tsx       # Linear-style hero, bento grid, and feature walk
│   │   │   ├── DashboardView.tsx     # Overview dashboard with equal-height metric cards
│   │   │   ├── BudgetView.tsx        # Budget ledger, Recharts breakdown, overspend alerts
│   │   │   ├── TimelineView.tsx      # List & Kanban boards with date shift reschedule
│   │   │   ├── VendorsView.tsx       # Vendor quotes, advance disbursements, AI audit
│   │   │   ├── IdeasView.tsx         # Category filter chips & one-click plan sync
│   │   │   ├── WhatIfSimulator.tsx   # Local client-side budget & guest slider simulator
│   │   │   ├── HealthScoreCard.tsx   # Event health gauge & active alert notifications
│   │   │   ├── CopilotSlideOver.tsx  # Sandboxed Copilot slide-over panel
│   │   │   ├── WizardModal.tsx       # Setup wizard with 44px inputs & validation
│   │   │   ├── EmptyState.tsx        # High-contrast tokenized empty state
│   │   │   └── SkeletonLoader.tsx    # Accessible shimmer skeleton loader
│   │   ├── services/
│   │   │   └── api.ts                # Typed fetch API client
│   │   ├── tests/
│   │   │   ├── unit.test.ts          # Vitest unit test suite (3/3 passing)
│   │   │   ├── e2e.runner.js         # Playwright E2E full user flow (100% passing)
│   │   │   └── axe_audit.js          # Axe-core WCAG 2.1 AA automated audit (0 violations)
│   │   ├── types/
│   │   │   └── index.ts              # Shared TypeScript data models
│   │   ├── App.tsx                   # Main root view with dark mode & event state
│   │   ├── index.css                 # Section 5.1 CSS tokens & micro-animations
│   │   └── main.tsx                  # Vite React entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── tests/
│   └── test_api.py             # Pytest backend API and business logic suite (6/6 passing)
├── seed.py                     # Populates 3 realistic Indian demo celebrations
├── requirements.txt            # Python dependencies (pip-audit clean)
├── .env.example                # Sample environment template
└── AUDIT.md                    # Quality, test, accessibility, and Lighthouse audit
```

---

## 🧪 Test & Audit Summary

- **Playwright E2E Flow:** 100% Passed (`npm run test:e2e`)
- **Axe WCAG 2.1 AA:** 0 Violations across all views (`npm run test:a11y`)
- **Vitest Unit Tests:** 3/3 Passed (`npm run test`)
- **Pytest Suite:** 6/6 Passed (`python -m pytest -v`)
- **Lighthouse Desktop:** Accessibility **98**, Best Practices **100**, SEO **91**
- **npm audit:** 0 vulnerabilities
- **pip-audit:** 0 vulnerabilities

---

## 🚀 Free Deployment Guide

Deploy Utsavly completely free on **Render** (Backend) and **Vercel** (Frontend):

### 1. Deploy Backend to Render (Free Web Service)
1. Fork or push this repository to GitHub.
2. Sign in to [Render](https://render.com) and click **New +** $\rightarrow$ **Blueprint** (or connect repository directly).
3. Select your repository. Render will automatically detect [`render.yaml`](file:///c:/Users/Meet/Desktop/pw/render.yaml):
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/api/health`
4. Set Environment Variables in the Render dashboard:
   - `AI_MOCK`: `true` (or `false` if using live Gemini)
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API key
   - `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app,http://localhost:5173`
   - `PYTHONPATH`: `..`
5. On the first startup, Utsavly automatically seeds the demo celebrations if the database is empty.
6. Note your Render URL (e.g. `https://utsavly-backend.onrender.com`). Verify it at `https://utsavly-backend.onrender.com/api/health` which returns `{"status":"ok"}`.

### 2. Deploy Frontend to Vercel (Free Static / SPA)
1. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add the Environment Variable:
   - `VITE_API_URL`: `https://utsavly-backend.onrender.com` (your Render backend URL)
5. Click **Deploy**. Vercel will build the frontend and apply SPA routing rewrites automatically via [`frontend/vercel.json`](file:///c:/Users/Meet/Desktop/pw/frontend/vercel.json).

### 3. Server Wake-up & Cold-Start UX
Render free instances spin down after 15 minutes of inactivity:
- Utsavly frontend automatically detects delays over 3 seconds and displays a clean **"Waking up the server..."** indicator with pulse animations.
- The frontend automatically retries the initial event fetch with backoff, ensuring smooth entry without manual page refreshes.

