import { Search, Bell, User } from 'lucide-react';
import type { User as UserType, View } from '../App';

interface NavigationProps {
  user: UserType;
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

export function Navigation({ user, currentView, onNavigate, onLogout: _onLogout }: NavigationProps) {
  // For non-authenticated views, show the original simple nav
  const isAuthView = user && ['dashboard', 'carbonlog', 'leaderboard', 'badges', 'goals', 'survey'].includes(currentView);

  if (!isAuthView) {
    // Simple navigation for hero/login/signup
    return (
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => onNavigate(user ? 'dashboard' : 'hero')}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-eco-green rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <span className="text-xl font-heading font-bold text-eco-forest hidden sm:block">CarbonCalc</span>
          </button>
        </div>
      </header>
    );
  }

  // Authenticated top bar with search, notifications, profile
  return (
    <header className="fixed top-0 left-[240px] right-0 z-40 bg-white/80 backdrop-blur-md border-b border-[rgba(61,139,93,0.08)] px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-eco-sage" />
          <input
            type="text"
            placeholder="Search logs or data..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-eco-bg border border-[rgba(61,139,93,0.12)] text-sm text-eco-forest placeholder:text-eco-sage/60 focus:outline-none focus:ring-2 focus:ring-eco-green/20 focus:border-eco-green/30 transition-all"
          />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 ml-4">
          {/* Notification Bell */}
          <button className="relative p-2 rounded-lg hover:bg-eco-bg-alt transition-colors">
            <Bell className="w-5 h-5 text-eco-sage" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-eco-green rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-[rgba(61,139,93,0.12)]">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-eco-forest">{user?.name}</p>
              <p className="text-xs text-eco-sage">Eco Warrior</p>
            </div>
            <div className="w-9 h-9 bg-eco-green-pale rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-eco-green" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
