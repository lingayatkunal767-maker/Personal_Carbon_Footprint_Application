# Quick Start Guide - Personal Carbon Footprint Application

## Backend Setup

### Prerequisites:
- Java 17 or higher
- Maven 3.8+
- MySQL Database (or your configured database)

### Running the Backend:

1. **Navigate to the backend directory:**
   ```bash
   cd backend/carbon
   ```

2. **Build the project:**
   ```bash
   mvn clean install
   ```

3. **Run the Spring Boot application:**
   ```bash
   mvn spring-boot:run
   ```
   
   The backend will start at: `http://localhost:9599`

4. **Verify it's running:**
   - Open `http://localhost:9599/api/emissions` (should redirect to login)
   - Check logs for: `CarbonApplication started in X seconds`

---

## Frontend Setup

### Prerequisites:
- Node.js 20.19+ or 22.12+
- npm or yarn package manager

### Running the Frontend:

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will start at: `http://localhost:5173`

4. **Open in browser:**
   - Navigate to `http://localhost:5173`
   - You should see the CarbonCalc landing page

---

## Application Flow

### **First Time Users:**
1. Click "Register" on the home page
2. Fill in your details (Name, Email, Password)
3. Submit the registration form
4. You'll be redirected to login

### **Logging In:**
1. Enter your email and password
2. Click "Login"
3. You'll be taken to the Dashboard

### **Dashboard:**
- View your carbon footprint summary
- Add new emissions manually
- Click "Lifestyle Survey" to fill out detailed lifestyle information
- Click "Carbon History" to view all your records

### **Lifestyle Survey:**
1. Complete Step 1: Transport Information
   - Select your primary transport mode
   - Enter average daily distance
   - Click "Next: Food & Diet"

2. Complete Step 2: Food & Diet Information
   - Select your diet type
   - Enter meals per day
   - Select eating frequency
   - Click "Next: Energy"

3. Complete Step 3: Home Energy Usage
   - Enter monthly electricity usage
   - Toggle renewable energy if applicable
   - Click "Calculate Footprint"

4. Your emissions will be saved and you'll return to Dashboard

### **Carbon History:**
- View all your recorded emissions in a table
- Filter by date range
- Filter by category (Transport, Food, Energy)
- Export data to CSV
- Delete individual records
- View summary statistics

### **Logout:**
- Click the "Logout" button in the top-right corner
- You'll be redirected to the login page

---

## API Endpoints

### Authentication:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Emissions:
- `GET /api/emissions` - Get all emissions for current user
- `POST /api/emissions` - Add new emission
- `PUT /api/emissions/{id}` - Update emission
- `DELETE /api/emissions/{id}` - Delete emission

### User Profile:
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

---

## Troubleshooting

### Backend won't start:
- Check if port 9599 is available: `netstat -ano | findstr :9599`
- Verify Java is installed: `java -version`
- Check database connection in `application.properties`
- View logs in `target/` directory

### Frontend won't start:
- Clear node_modules: `rm -r node_modules` then `npm install`
- Clear npm cache: `npm cache clean --force`
- Check if port 5173 is available
- Update Node.js to version 20.19 or higher

### Can't log in:
- Verify backend is running at `http://localhost:9599`
- Check browser console for error messages (F12)
- Verify user was registered successfully
- Check network tab to see API responses

### Emissions not appearing:
- Refresh the page
- Check browser console for JavaScript errors
- Verify you're logged in
- Check network tab - should see GET /api/emissions with 200 status

### CORS errors:
- Ensure backend has `@CrossOrigin` annotation on controllers
- Check if correct backend URL is in `api.js` (http://localhost:9599)

---

## Environment Configuration

### `.env` file (if needed):
Create a `.env` file in the `frontend` directory:
```
VITE_API_URL=http://localhost:9599
```

### Backend `application.properties`:
Located at `backend/carbon/src/main/resources/application.properties`
- Database URL configuration
- JWT secret key
- Server port (default 9599)

---

## Browser Developer Tools

Access the developer console with **F12** to:
- View console errors
- Check network requests with the "Network" tab
- View application data in the "Application" tab
- Debug JavaScript with the "Sources" tab

---

## Building for Production

### Frontend:
```bash
cd frontend
npm run build
npm run preview  # To test the build locally
```

The built files will be in `frontend/dist/`

### Backend:
```bash
cd backend/carbon
mvn clean package -DskipTests
java -jar target/carbon-0.0.1-SNAPSHOT.jar
```

---

## Support

For issues or questions:
1. Check the console (F12) for error messages
2. Review the API response in Network tab
3. Verify backend is running
4. Ensure all dependencies are installed
5. Clear browser cache and local storage (if needed)

---

## Features Implemented

✅ User Registration & Authentication
✅ Dashboard with emission summary
✅ Add new emissions manually
✅ Multi-step lifestyle survey form
✅ Carbon footprint calculation
✅ Emission history with pagination
✅ Filtering by date and category
✅ Export to CSV
✅ Responsive design
✅ Eco tips and motivational messages
✅ JWT authentication
✅ Protected routes

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Application:** CarbonCalc - Environmentally Conscious Tracking
