# Carbon API - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Prerequisites Check
```bash
# Check Java version (need 17+)
java -version

# Check PostgreSQL is running
psql --version
```

### 2. Database Setup
```bash
# Create database
createdb carboncals

# Run SQL script
psql -U postgres -d carboncals -f database/create_database.sql
```

### 3. Build & Run
```bash
# Build the project
./mvnw clean install

# Start the application
./mvnw spring-boot:run
```

✅ **Server running at**: http://localhost:8080

---

## 📱 Quick API Test

### Via cURL

#### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**Copy the token from response**

#### Get Profile (Replace TOKEN with actual token)
```bash
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer TOKEN"
```

#### Create Emission
```bash
curl -X POST http://localhost:8080/api/emissions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Transportation",
    "activityType": "Driving",
    "quantity": 50,
    "carbonOutput": 12.5
  }'
```

#### Get All Emissions
```bash
curl http://localhost:8080/api/emissions \
  -H "Authorization: Bearer TOKEN"
```

---

## 📊 API Endpoint Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login & get token |
| GET | `/api/users/me` | ✅ | Get current user |
| PUT | `/api/users/me` | ✅ | Update profile |
| GET | `/api/emissions` | ✅ | List all emissions |
| GET | `/api/emissions/{id}` | ✅ | Get single emission |
| POST | `/api/emissions` | ✅ | Create emission |
| PUT | `/api/emissions/{id}` | ✅ | Update emission |
| DELETE | `/api/emissions/{id}` | ✅ | Delete emission |

---

## 🔒 Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token expires in**: 24 hours

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `pom.xml` | Project dependencies & build config |
| `application.properties` | App configuration (database, JWT) |
| `SecurityConfig.java` | Spring Security setup |
| `JwtUtil.java` | JWT token handling |
| Controllers | REST endpoint definitions |
| Entities | Database table mappings |
| Repositories | Database queries |

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Port 8080 in use | Change `server.port` in `application.properties` |
| DB connection error | Check PostgreSQL running & credentials correct |
| Token invalid | Re-login and get new token |
| Email conflict | Use different email address |

---

## 📚 Full Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for comprehensive guide including:
- System architecture
- Database schema
- Detailed API specifications
- Error codes
- Security details
- Development tips
