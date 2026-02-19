# CarbonTracker – Frontend

React single‑page application for the CarbonTracker project.

### Tech stack

- React (Create React App)
- React Router
- Axios

### Prerequisites

- Node.js and npm installed
- Backend running on `http://localhost:8080` (default)

### Setup

```bash
cd frontend
npm install
```

### Run in development

```bash
npm start
```

- App runs at `http://localhost:3000`
- Proxies API calls to the backend URL you configured (usually `http://localhost:8080`)

### Build for production

```bash
npm run build
```

Build output is written to the `build/` folder.

### Main routes

- `/` or `/login` – Login (email/password + Google/GitHub OAuth)
- `/register` – Register with validations + Terms/Privacy
- `/forgot-password` and `/reset-password/:token`
- `/dashboard` – Protected dashboard with emission summary and add‑emission form

### Where to configure API URL

If you need to change the backend base URL, update the Axios configuration file (e.g. `src/api.js` or where `axios.create` is defined) so that it points to your backend server. 