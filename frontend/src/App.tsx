import { useState } from 'react';
import { Hero } from './sections/Hero';
import { Login } from './sections/Login';
import { SignUp } from './sections/SignUp';
import { Dashboard } from './sections/Dashboard';
import { CarbonLog } from './sections/CarbonLog';
import { Leaderboard } from './sections/Leaderboard';
import { EcoBadges } from './sections/EcoBadges';
import { Goals } from './sections/Goals';
import { LifestyleSurvey } from './sections/LifestyleSurvey';
import { ClosingCTA } from './sections/ClosingCTA';
import { Navigation } from './components/Navigation';
import { Sidebar } from './components/Sidebar';
import { Toaster } from '@/components/ui/sonner';

export type User = {
  id: number;
  name: string;
  email: string;
  memberSince: string;
} | null;

export type View = 'hero' | 'login' | 'signup' | 'dashboard' | 'carbonlog' | 'leaderboard' | 'badges' | 'goals' | 'survey';

function App() {
  const [user, setUser] = useState<User>(() => {
    try {
      const savedUser = localStorage.getItem('carboncalc_user');
      if (!savedUser) return null;

      const parsedUser = JSON.parse(savedUser) as Partial<NonNullable<User>> | null;
      if (!parsedUser || typeof parsedUser !== 'object') return null;

      const fallbackName = typeof parsedUser.email === 'string'
        ? parsedUser.email.split('@')[0] || 'User'
        : 'User';
      const resolvedName = typeof parsedUser.name === 'string' && parsedUser.name.trim()
        ? parsedUser.name
        : fallbackName;
      const resolvedEmail = typeof parsedUser.email === 'string' ? parsedUser.email : '';
      const resolvedId = typeof parsedUser.id === 'number' ? parsedUser.id : Date.now();
      const resolvedMemberSince = typeof parsedUser.memberSince === 'string' && parsedUser.memberSince.trim()
        ? parsedUser.memberSince
        : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      return {
        id: resolvedId,
        name: resolvedName,
        email: resolvedEmail,
        memberSince: resolvedMemberSince,
      };
    } catch {
      localStorage.removeItem('carboncalc_user');
      return null;
    }
  });
  const [currentView, setCurrentView] = useState<View>('hero');
  const [isLoading] = useState(false);

  const normalizeUser = (userData: User): User => {
    if (!userData) return null;

    const resolvedName = userData.name?.trim()
      ? userData.name
      : (userData.email?.split('@')[0] || 'User');
    const resolvedEmail = userData.email ?? '';
    const resolvedMemberSince = userData.memberSince?.trim()
      ? userData.memberSince
      : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return {
      id: typeof userData.id === 'number' ? userData.id : Date.now(),
      name: resolvedName,
      email: resolvedEmail,
      memberSince: resolvedMemberSince,
    };
  };

  const handleLogin = (userData: User) => {
    const safeUser = normalizeUser(userData);
    setUser(safeUser);
    if (safeUser) {
      localStorage.setItem('carboncalc_user', JSON.stringify(safeUser));
    }
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('carboncalc_user');
    setCurrentView('hero');
  };

  const navigateTo = (view: View) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAuthenticatedView = user && ['dashboard', 'carbonlog', 'leaderboard', 'badges', 'goals', 'survey'].includes(currentView);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-eco-bg flex items-center justify-center">
        <div className="animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-eco-green rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <span className="text-2xl font-heading font-bold text-eco-forest">CarbonCalc</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eco-bg">
      <Navigation
        user={user}
        currentView={currentView}
        onNavigate={navigateTo}
        onLogout={handleLogout}
      />

      {isAuthenticatedView && (
        <Sidebar
          currentView={currentView}
          onNavigate={navigateTo}
          onLogout={handleLogout}
        />
      )}

      <main className={isAuthenticatedView ? 'ml-[240px]' : ''}>
        {currentView === 'hero' && (
          <Hero onStart={() => navigateTo('login')} />
        )}

        {currentView === 'login' && (
          <Login
            onLogin={handleLogin}
            onNavigateToSignup={() => navigateTo('signup')}
          />
        )}

        {currentView === 'signup' && (
          <SignUp
            onSignup={handleLogin}
            onNavigateToLogin={() => navigateTo('login')}
          />
        )}

        {currentView === 'dashboard' && user && (
          <Dashboard
            user={user}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'carbonlog' && user && (
          <CarbonLog
            user={user}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'leaderboard' && user && (
          <Leaderboard
            user={user}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'badges' && user && (
          <EcoBadges
            user={user}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'goals' && user && (
          <Goals
            user={user}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'survey' && user && (
          <LifestyleSurvey
            user={user}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {currentView === 'hero' && !user && (
        <ClosingCTA onSignup={() => navigateTo('signup')} />
      )}

      {/* Footer for authenticated views */}
      {isAuthenticatedView && (
        <footer className="ml-[240px] py-4 text-center text-xs text-eco-sage border-t border-[rgba(61,139,93,0.08)] bg-white/50">
          © 2026 CarbonCalc • Environmentally Conscious Tracking
        </footer>
      )}

      <Toaster position="top-center" />
    </div>
  );
}

export default App;
