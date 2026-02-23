# 🚀 Quick Start Guide - Backend Setup

## Step-by-Step Process

### ✅ Step 1: Install PostgreSQL (15 minutes)

1. Download PostgreSQL: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Port: `5432` (keep default)
   - Password: Choose and **remember this password!**
   - Install pgAdmin 4 (database GUI)
4. Click "Finish"

### ✅ Step 2: Create Database (5 minutes)

**Option A: Using pgAdmin (Easier)**
1. Open **pgAdmin 4** from Start Menu
2. Enter your password
3. Right-click **Databases** → **Create** → **Database**
4. Name: `sustainability_tracker`
5. Click **Save**

**Option B: Using Command Line**
```bash
# Open PowerShell
psql -U postgres

# Enter password, then run:
CREATE DATABASE sustainability_tracker;

# Verify:
\l

# Exit:
\q
```

### ✅ Step 3: Run Database Schema (5 minutes)

```bash
# Navigate to project
cd "D:\infosys project\database"

# Run schema
psql -U postgres -d sustainability_tracker -f schema.sql

# Run seed data (optional - adds test data)
psql -U postgres -d sustainability_tracker -f seed-data.sql
```

You should see: `CREATE TABLE` messages for each table.

### ✅ Step 4: Generate Spring Boot Project (10 minutes)

1. **Go to:** https://start.spring.io/

2. **Configure:**
   ```
   Project: Maven
   Language: Java
   Spring Boot: 3.2.2
   
   Project Metadata:
   - Group: com.sustainability
   - Artifact: tracker
   - Name: SustainabilityTracker
   - Package name: com.sustainability.tracker
   - Packaging: Jar
   - Java: 17
   ```

3. **Click "Add Dependencies" and add:**
   - Spring Web
   - Spring Data JPA
   - PostgreSQL Driver
   - Lombok
   - Validation

4. **Click "Generate"** - Downloads a ZIP file

5. **Extract ZIP** to: `D:\infosys project\backend\`

### ✅ Step 5: Configure Spring Boot (5 minutes)

1. Open: `backend/src/main/resources/application.properties`

2. Replace content with:
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/sustainability_tracker
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD_HERE

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Server
server.port=8080

# CORS - Allow frontend
spring.web.cors.allowed-origins=http://localhost:3000
```

3. **Replace** `YOUR_PASSWORD_HERE` with your PostgreSQL password

### ✅ Step 6: Create Java Files

Copy the code from `BACKEND_SETUP_GUIDE.md` to create:

**📁 Model Classes:** (in `src/main/java/com/sustainability/tracker/model/`)
- `User.java`
- `CarbonActivity.java`
- `Goal.java`
- `Badge.java`

**📁 Repositories:** (in `src/main/java/com/sustainability/tracker/repository/`)
- `UserRepository.java`
- `CarbonActivityRepository.java`
- `GoalRepository.java`
- `BadgeRepository.java`

**📁 Services:** (in `src/main/java/com/sustainability/tracker/service/`)
- `UserService.java`
- `ActivityService.java`

**📁 Controllers:** (in `src/main/java/com/sustainability/tracker/controller/`)
- `UserController.java`
- `CarbonActivityController.java`

### ✅ Step 7: Run Backend (2 minutes)

**Using Maven:**
```bash
cd "D:\infosys project\backend"
mvnw spring-boot:run
```

**Or in IDE (IntelliJ/VS Code):**
- Open `SustainabilityTrackerApplication.java`
- Click ▶️ Run

**Success looks like:**
```
Started SustainabilityTrackerApplication in 3.456 seconds
Tomcat started on port(s): 8080
```

### ✅ Step 8: Test API (5 minutes)

**Using Browser:**
```
http://localhost:8080/api/users/1
```

**Using PowerShell:**
```powershell
# Create user
Invoke-RestMethod -Uri "http://localhost:8080/api/users" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Test User","email":"test@example.com","oauthProvider":"google"}'

# Get user
Invoke-RestMethod -Uri "http://localhost:8080/api/users/1"
```

### ✅ Step 9: Connect Frontend (10 minutes)

1. Frontend API service already created at: `src/services/api.js`

2. Update any component to use it:

```javascript
// In HomePage.jsx or any component
import { api } from '../services/api';

// Example: Load user activities
useEffect(() => {
  const loadData = async () => {
    try {
      const userId = 1; // Get from auth
      const activities = await api.activity.getUserActivities(userId);
      console.log('Activities:', activities);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  loadData();
}, []);
```

### ✅ Step 10: Run Both Together

**Terminal 1 - Backend:**
```bash
cd backend
mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd "D:\infosys project"
npm run dev
```

Now:
- Backend API: http://localhost:8080
- Frontend App: http://localhost:3000
- Database: PostgreSQL on localhost:5432

---

## 🎯 Learning Path

### Week 1: Setup & Basics
- ✅ Install PostgreSQL
- ✅ Create database schema
- ✅ Setup Spring Boot
- ✅ Create first API endpoint

### Week 2: Build APIs
- Create all CRUD operations
- Test with Postman
- Add validation
- Handle errors

### Week 3: Connect Frontend
- Integrate API calls
- Display real data
- Add loading states
- Handle errors in UI

### Week 4: Advanced Features
- Add authentication (JWT)
- Add file upload (profile pictures)
- Optimize queries
- Add caching

---

## 🆘 Common Issues

### "Password authentication failed"
```
Solution: Check password in application.properties matches PostgreSQL password
```

### "Port 8080 already in use"
```
Solution: Change to 8081 in application.properties:
server.port=8081
```

### "Could not find or load main class"
```
Solution: Run 'mvn clean install' first
```

### "CORS error in browser"
```
Solution: Add @CrossOrigin to your controllers
```

### "Database connection refused"
```
Solution: 
1. Check PostgreSQL is running: services.msc
2. Verify port 5432 is correct
3. Test: psql -U postgres -d sustainability_tracker
```

---

## 📚 Additional Resources

**Learn Spring Boot:**
- https://spring.io/guides/gs/spring-boot/
- YouTube: "Spring Boot Tutorial for Beginners"

**Learn PostgreSQL:**
- https://www.postgresqltutorial.com/

**Test APIs:**
- Postman: https://www.postman.com/

---

## ✅ Checklist

- [ ] PostgreSQL installed
- [ ] Database created
- [ ] Schema loaded
- [ ] Seed data loaded (optional)
- [ ] Spring Boot project generated
- [ ] application.properties configured
- [ ] Model classes created
- [ ] Repository interfaces created
- [ ] Controller classes created
- [ ] Backend running on port 8080
- [ ] API tested (can create/get user)
- [ ] Frontend API service created
- [ ] Frontend connected to backend
- [ ] Both running together

---

**Need Help?** Check `BACKEND_SETUP_GUIDE.md` for detailed code examples!
