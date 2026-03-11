# 🌿 Sustainability Tracker

A full-stack web application for tracking and reducing personal carbon footprint with Google OAuth authentication.

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green?style=flat&logo=springboot)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=flat&logo=postgresql)

## ✨ Features

- 🔐 **Google OAuth 2.0** authentication
- 📊 **Carbon footprint tracking** (transport, diet, energy)
- 🎯 **Personal reduction goals** and progress tracking
- 🏆 **Eco-badges** and leaderboard
- 📈 **Monthly comparison** and insights
- 🔔 **Personalized notifications** and eco-tips

## 🏗️ Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- React Router

**Backend**
- Spring Boot 3.2
- Spring Data JPA
- PostgreSQL

**Authentication**
- Google OAuth 2.0
- JWT tokens

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Java 17+
- PostgreSQL 15+
- Maven

### Setup
1. **Database**: Run `.\setup-database.ps1` or see [SETUP.md](SETUP.md)
2. **Backend**: Run `.\start-backend.bat` or `cd backend && mvn spring-boot:run`
3. **Frontend**: Run `cd frontend && npm install && npm run dev`
4. **Configure Google OAuth**: See [docs/GOOGLE_AUTH.md](docs/GOOGLE_AUTH.md)

**📖 Full setup instructions: [SETUP.md](SETUP.md)**

## 📁 Project Structure

```
infosys-project/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   └── services/     # API service layer
│   └── package.json
├── backend/               # Spring Boot API
│   ├── src/main/java/
│   │   └── com/sustainability/tracker/
│   │       ├── controller/   # REST endpoints
│   │       ├── service/      # Business logic
│   │       ├── entity/       # Database models
│   │       └── repository/   # Data access
│   └── pom.xml
├── database/              # SQL scripts
│   ├── schema.sql        # Database schema
│   └── seed-data.sql     # Sample data
└── docs/                  # Documentation
```

## 🔧 Configuration

**Frontend** (`frontend/.env`):
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_API_URL=http://localhost:8081/api
```

**Backend** (`backend/src/main/resources/application.properties`):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sustainability_tracker
spring.datasource.username=tracker_user
spring.datasource.password=tracker123
server.port=8081
```

## 📚 Documentation

- [Complete Setup Guide](SETUP.md)
- [Google OAuth Setup](docs/GOOGLE_AUTH.md)
- [Backend API Documentation](backend/README.md)

## 🎨 Design System

**Color Palette**
- Forest Green (`#1a3d2b`) - Primary
- Sage (`#5a8a6a`) - Accent
- Warm Off-White (`#faf7f2`) - Background

**Typography**
- Headlines: Playfair Display
- Body: DM Sans
- Card entrance animation
- Rotating fact ticker (5s interval)
- Loading spinner
- Toast notifications

## 🔐 Authentication Flow

\`\`\`
User clicks "Continue with Google"
  ↓
Google One Tap prompt appears
  ↓
User selects Google account
  ↓
JWT credential returned
  ↓
Decode JWT → extract user name
  ↓
Show success toast: "Welcome back, {Name}! 🌿"
  ↓
Redirect to /home (1.2s delay)
\`\`\`

**Fallback**: If One Tap is blocked → automatic redirect to OAuth URL

## 📱 Responsive Breakpoints

- **Desktop**: > 860px (split panel)
- **Tablet**: ≤ 860px (stacked layout)
- **Mobile**: ≤ 480px (optimized spacing)

## 🛠️ Available Scripts

\`\`\`bash
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
\`\`\`

## 🐛 Troubleshooting

### "Please configure GOOGLE_CLIENT_ID first"
→ Replace placeholder in `LoginPage.jsx` line 11 or set `.env` variable

### "redirect_uri_mismatch"
→ Add exact redirect URI in Google Cloud Console

### Popup blocked
→ App automatically falls back to redirect flow

### Port already in use
→ Change port in `vite.config.js` or kill process on port 5173

See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for detailed troubleshooting.

## 🚀 Production Deployment

### Vercel (Recommended)

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### Netlify

\`\`\`bash
npm run build
# Drag /dist folder to Netlify
\`\`\`

### Manual

\`\`\`bash
npm run build
# Deploy /dist folder to your hosting
\`\`\`

**Important**: Update Google OAuth redirect URIs with production domain!

## 🌍 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Design inspired by modern sustainability movements
- Google Fonts: Playfair Display & DM Sans
- Google Identity Services for OAuth
- React team for the amazing framework

## 📚 Resources

- [📖 Detailed Setup Guide](./SETUP_INSTRUCTIONS.md)
- [🔗 Google Identity Services](https://developers.google.com/identity/gsi/web)
- [⚛️ React Documentation](https://react.dev/)
- [⚡ Vite Documentation](https://vitejs.dev/)

---

**Made with 💚 for the planet** | © 2025 Personal Footprint
