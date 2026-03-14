# 🚀 Complete Setup Guide

## Prerequisites

- Node.js 16+ and npm
- Java 17+
- PostgreSQL 15+
- Maven (for backend)

---

## 📁 Project Structure

```
infosys-project/
├── frontend/          # React + Vite application
├── backend/           # Spring Boot API
└── database/          # SQL scripts
```

---

## 1️⃣ Database Setup

### Install PostgreSQL
1. Download from https://www.postgresql.org/download/
2. Install with default port `5432`
3. Remember your postgres password

### Setup Database
Run the PowerShell script:
```powershell
.\scripts\setup-database.ps1
```

Or manually:
```bash
# Create database
psql -U postgres -c "CREATE DATABASE sustainability_tracker;"

# Run schema
psql -U postgres -d sustainability_tracker -f database\schema.sql

# Optional: Load seed data
psql -U postgres -d sustainability_tracker -f database\seed-data.sql
```

---

## 2️⃣ Backend Setup

### Configure Application
1. Navigate to `backend/src/main/resources/application.properties`
2. Update PostgreSQL password if needed:
```properties
spring.datasource.password=your_password
```

### Start Backend
```bash
cd backend
mvn spring-boot:run
```

Or use the batch file:
```bash
.\scripts\start-backend.bat
```

Backend will run on: http://localhost:8081

---

## 3️⃣ Frontend Setup

### Install Dependencies
```bash
cd frontend
npm install
```

### Configure Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 credentials
3. Add authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
4. Add authorized redirect URIs:
   - `http://localhost:5173/auth/callback`
   - `http://127.0.0.1:5173/auth/callback`
5. Copy your Client ID

### Configure Environment
Create `frontend/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_API_URL=http://localhost:8081/api
```

### Start Frontend
```bash
npm run dev
```

Frontend will run on: http://localhost:5173

---

## 4️⃣ Verification

1. **Database**: Run `psql -U postgres -d sustainability_tracker -c "\dt"` to see tables
2. **Backend**: Visit http://localhost:8081/api/health (should return 200 OK)
3. **Frontend**: Open http://localhost:5173 (should see login page)
4. **Google Auth**: Click "Continue with Google" and sign in

---

## 🔧 Troubleshooting

### Google OAuth Error: "origin_mismatch"
- Verify URLs in Google Cloud Console match exactly:
  - `http://localhost:5173` (no trailing slash)
- Clear browser cache and try in incognito mode
- See [docs/GOOGLE_AUTH.md](docs/GOOGLE_AUTH.md) for details

### Backend Connection Issues
- Check PostgreSQL is running: `pg_isready -U postgres`
- Verify port 8081 is not in use
- Check `application.properties` credentials

### Frontend Build Issues
- Delete `node_modules` and run `npm install` again
- Clear Vite cache: `rm -rf node_modules/.vite`

---

## 📚 Additional Documentation

- [Google OAuth Setup](docs/GOOGLE_AUTH.md)
- [Backend API Documentation](backend/README.md)
- [Database Schema](database/schema.sql)

---

## 🎯 Quick Commands

```bash
# Start everything (from root)
.\scripts\start-backend.bat    # Terminal 1
cd frontend && npm run dev   # Terminal 2

# Reset database
psql -U postgres -d sustainability_tracker -f database\schema.sql

# Clean backend build
cd backend && mvn clean

# Rebuild frontend
cd frontend && npm run build
```
