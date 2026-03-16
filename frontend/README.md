# CarbonCalc — Frontend

## Overview

React.js single-page application providing the UI for CarbonCalc: login/register, dashboard, lifestyle survey, carbon history, goals, gamification (badges, leaderboards), and the eco marketplace.

## Tech stack

- React.js (v18+)
- Tailwind CSS for styling
- State management: React Context / Redux (project-specific)
- HTTP client: fetch or Axios

## Prerequisites

- Node.js 16+ (recommended 18+)
- npm, yarn, or pnpm

## Configuration

Create a `.env` file in the `frontend/` root with at least:

- `REACT_APP_API_BASE_URL` — backend API URL (e.g. http://localhost:8080/api)
- `REACT_APP_MAPS_API_KEY` — optional, for any location-based features

## Install & Run

```bash
# install dependencies
npm install

# development
npm start

# build for production
npm run build
```

## Usage notes

- The app expects the backend's auth endpoints for JWT login/register and token refresh.
- Store access tokens in memory or secure storage; follow best practices for refresh tokens.
- Tailwind configuration is in `tailwind.config.js` — adjust theme/colors as needed.

## Testing & Lint

```bash
npm test
npm run lint
```

## Deployment

- Serve the `build/` folder via any static hosting (Netlify, Vercel, S3 + CloudFront, or an Nginx web server).
- Configure `REACT_APP_API_BASE_URL` for the production backend.
