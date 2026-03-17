# CarbonCalc (Frontend)

React frontend for the **Personal Carbon Footprint** application.

Users log in via Google/GitHub, track their carbon emissions, set goals, earn badges, and view a global leaderboard.  
Admins can manage users and badges from an admin dashboard.

---

## Quick start (for developers)

### 1. Start the backend

From `backend/`:

```bash
cd backend
mvn spring-boot:run
```

Backend runs on **http://localhost:8080**.  
See `backend/README.md` and `db_scripts/schema.sql` for PostgreSQL setup.

### 2. Start the frontend

From `frontend/`:

```bash
cd frontend
npm install        # first time only
npm start
```

Frontend runs on **http://localhost:3000**.

The frontend uses `REACT_APP_API_URL` as API base (default `http://localhost:8080`).

---

## Main features

### Layout & auth

- Uses OAuth2 login (Google / GitHub) → backend redirects back with `?token=...`.
- JWT is stored in `localStorage` and attached as `Authorization: Bearer <token>` for all API calls.
- `AppLayout` component:
  - Sidebar navigation (Dashboard, My Badges, Leaderboard, etc.)
  - Header with welcome message and profile dropdown (Profile, Logout)
  - Mobile‑friendly responsive layout.

### User dashboard (`/dashboard`)

- Time filter (Daily / Weekly / Monthly).
- Calls:
  - `GET /api/carbon/logs?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Shows:
  - Total emissions for the period
  - Category‑wise breakdown (Transport, Food, Energy)
  - Emission trend chart
  - Recent logs table with “View details” links to `/carbon-history`.

### My Badges (`/badges`)

- Fetches:
  - `GET /api/badge-templates` — active templates
  - `GET /api/badges` — earned badges for current user
- Features:
  - Overall progress bar (earned vs total)
  - Filter tabs: **All / Earned / Locked**
  - Emoji icons for each badge (resolved even if DB icon is `??`)
  - Click a badge to open a modal with description and earned date.

### Leaderboard (`/leaderboard`)

- Fetches:
  - `GET /api/auth/me` — current user
  - `GET /api/leaderboard` — full ranking for non‑admin users
- UI:
  - Top‑3 podium with medals
  - “Top 10 Rankings” table (desktop) / card list (mobile)
  - Ensures the current user is always shown and highlighted, even if they are outside the top 10.

### Admin dashboard (`/AdminDashboard`)

Admin‑only panel (role `ADMIN`) with multiple tabs:

- **Users**
  - Table of non‑admin users.
  - Inline filters: **All / Active / Blocked**.
  - Search by name/email/ID.
  - Actions:
    - **Block / Unblock** → `PUT /api/users/{id}/block` / `unblock`
    - **Delete** → `DELETE /api/users/{id}` (soft delete: marks as inactive)

- **Carbon Data**
  - Shows carbon logs using `GET /api/carbon/logs`.

- **Goals**
  - Shows goals of all non‑admin users using `GET /api/goals/admin`.

- **Badges**
  - **Badge Templates**
    - Card grid of templates with emoji icons.
    - Header shows `Badge Templates (N)` and inline filters: **All badges / Active / Disabled**.
    - “+ Create Badge” opens a modal:
      - Fields: Name, Short Description, Condition, Icon (emoji), Active.
      - Create: `POST /api/badge-templates`
      - Edit existing: clicking **Edit** on a card opens the same modal pre‑filled and uses `PUT /api/badge-templates/{id}`.
      - Validation and success messages are displayed inside the modal.
  - **Award Badge**
    - Opens a modal with:
      - User select (non‑admin users only) + chips for multiple selected users.
      - Badge template select.
    - Awards badges by calling `POST /api/badges/award/{userId}` for each selected user.
    - Shows inline messages inside the modal:
      - Green for success (`Badge awarded to X user(s).`).
      - Red if the badge was already awarded or another error occurred.

---

## Environment configuration

The frontend reads:

- `REACT_APP_API_URL` — backend base URL (default `http://localhost:8080`).

Example `.env` in the repo root:

```bash
REACT_APP_API_URL=http://localhost:8080
```

Restart `npm start` after changing environment variables.

---

## Development notes

- Ensure CORS on the backend allows `http://localhost:3000`.
- All protected routes redirect to login if the JWT is missing or invalid.
- UI is responsive (desktop + mobile) for all main pages: Dashboard, Badges, Leaderboard, and Admin Dashboard.

For backend and database details see:

- `backend/README.md`
- `db_scripts/schema.sql`

