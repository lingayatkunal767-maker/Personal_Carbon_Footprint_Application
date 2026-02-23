# 🌿 Personal Footprint - Sustainability Tracker

A production-grade React application with Google OAuth authentication for tracking and reducing carbon emissions.

![Personal Footprint Login](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🔐 **Google OAuth 2.0** authentication with One Tap login
- 🎨 **Beautiful split-panel design** with animated gradients
- 📊 **Carbon footprint statistics** and rotating eco-facts
- 📱 **Fully responsive** (desktop, tablet, mobile)
- ⚡ **Fast & modern** (Vite + React 18)
- 🌍 **Sustainability-focused** UI with earth-tone palette
- 🎭 **Smooth animations** (CSS keyframes, no libraries)

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Google Cloud Console account
- Basic knowledge of React

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized origins: `http://localhost:3000`
5. Add redirect URIs: `http://localhost:3000/auth/callback`
6. Copy your Client ID

### 3. Set Up Environment Variables

\`\`\`bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Client ID
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
\`\`\`

**Alternative**: Edit `LoginPage.jsx` line 11 directly:
\`\`\`javascript
const GOOGLE_CLIENT_ID = "your_actual_client_id_here";
\`\`\`

### 4. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the app! 🎉

## 📁 Project Structure

\`\`\`
personal-footprint-app/
├── index.html              # HTML entry point
├── main.jsx                # React entry point
├── App.jsx                 # Router configuration
├── LoginPage.jsx           # Login page component ⭐
├── HomePage.jsx            # Dashboard page
├── AuthCallback.jsx        # OAuth redirect handler
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── SETUP_INSTRUCTIONS.md   # Detailed setup guide
└── README.md               # This file
\`\`\`

## 🎨 Design System

### Color Palette
- **Forest Green** (`#1a3d2b`) - Primary dark
- **Moss** (`#2e5e42`) - Medium green
- **Sage** (`#5a8a6a`) - Accent green
- **Fern** (`#89bb97`) - Light green highlights
- **Warm Off-White** (`#faf7f2`) - Background

### Typography
- **Headlines**: Playfair Display (serif)
- **Body/UI**: DM Sans (sans-serif)

### Animations
- Mesh gradient shift (12s loop)
- Floating leaves (15-28s per leaf)
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
npm run dev      # Start development server (port 3000)
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
→ Change port in `vite.config.js` or kill process on port 3000

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
