# CarbonCalc (Carbon Tracker)

Web app to track and reduce your carbon footprint. Users register, complete a lifestyle survey (transport, food, energy), and view their dashboard, carbon history, and profile.


## Quick start (for developers)

### 1. Backend

```bash
cd backend
# Ensure PostgreSQL is running and DB exists (see backend/README.md)
./mvnw spring-boot:run
```

- API base: **http://localhost:8080**

### 2. Frontend

```bash
cd frontend
npm start
```

- App: **http://localhost:3000**
- By default the frontend calls **http://localhost:8080** for the API (see [Connecting frontend to backend](#connecting-frontend-to-backend)).

### 3. Run both

- Terminal 1: run backend (above).
- Terminal 2: run frontend (above).
- Open http://localhost:3000 and log in or register.


### Profile (needed for Profile page)

| Method | Path | Used by | Body / notes |
|--------|------|--------|----------------|
| GET | `/api/auth/me` | Profile (load) | Protected. Return `{ name, email }` (or more). |
| PUT | `/api/auth/profile` | Profile (save) | Protected. Body: `{ name, email }` and optionally `{ password }`. |

If these are missing, the Profile page will still open but load empty name/email and save will fail until the backend implements them.

### Lifestyle survey 

| Method | Path | Used by | Body / notes |
|--------|------|--------|----------------|
| POST | `/api/survey` or similar | LifestyleSurvey (submit) | Protected. Body: survey fields (transport mode, distance, fuel type, diet, meals, eat outside, electricity kWh, renewable yes/no). |

Frontend currently uses mock success; replace with real POST when backend is ready.

### Carbon history / dashboard

- Dashboard and Carbon History currently use **mock data** in the frontend.
- When the backend has endpoints for carbon logs or aggregated stats, the frontend can be wired to them (e.g. GET logs by date range, GET dashboard summary).


## Changes made (summary)

- **Frontend**
  - **Dashboard:** Carbon summary card with time filter (Daily/Weekly/Monthly), category breakdown (Transport, Food, Energy), emission trend line chart, recent carbon logs table with “View details”.
  - **Lifestyle survey (`/survey`):** Transport (mode: Car, Bike, Public, Walk, Work from home; distance; fuel type only when Car), Food (diet, meals per day, eating outside), Home energy (monthly kWh, renewable). Validations and optional distance for WFH. Submit shows success and redirects to dashboard.
  - **Carbon history (`/carbon-history`):** Working From/To date picker with validation (no future, max 365 days, From ≤ To). Table view and trend chart toggle. Pagination. Export CSV button removed.
  - **Profile (`/profile`):** Replaced static card with edit form: name, email (loaded from API), new password, confirm password (optional). Load from GET `/api/auth/me`, save via PUT `/api/auth/profile`.
  - **Layout:** Shared sidebar + header; welcome message instead of search bar; profile dropdown in header (Profile → `/profile`, Logout). Sidebar: Dashboard, Lifestyle Survey, Carbon History; Settings, Logout.
  - **Theme:** Green/slate theme; light sidebar; consistent buttons and cards.
- **Backend connection**
  - All API base URLs use `REACT_APP_API_URL` (default `http://localhost:8080`).
  - Protected pages use `Authorization: Bearer <token>`.
  - Backend team: implement GET `/api/auth/me` and PUT `/api/auth/profile` for the Profile page; optional POST for survey and endpoints for dashboard/carbon history when ready.

---

1. **CORS:** Allow the frontend origin (e.g. `http://localhost:3000` in development).
2. **Profile:** Implement GET `/api/auth/me` and PUT `/api/auth/profile` so the Profile page can load and save name, email, and optional password.
3. **Survey:** When ready, expose a POST endpoint for lifestyle survey data so the frontend can replace the mock submit.
4. **Logs/aggregates:** When you have carbon logs or aggregates, define GET endpoints (e.g. by date range) so the frontend can replace mock data on Dashboard and Carbon History.

