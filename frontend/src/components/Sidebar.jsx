import {
    LayoutDashboard, ClipboardList, History,
    Settings, LogOut, ChevronRight,
    ShoppingBag, Trophy
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { label: 'Dashboard', view: '/dashboard', icon: LayoutDashboard },
    { label: 'Lifestyle Survey', view: '/survey', icon: ClipboardList },
    { label: 'Carbon History', view: '/history', icon: History },
    { label: 'My Goals', view: '/goals', icon: Trophy },
    { label: 'Eco Marketplace', view: '/marketplace', icon: ShoppingBag },
    { path: "/leaderboard", name: "Leaderboard", icon: Trophy }, // <--- ADD THIS LINE
];

export function Sidebar({ onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-white border-r border-gray-100 flex flex-col z-50">
            {/* Logo Section */}
            <div className="px-5 py-5 flex items-center gap-2.5">
                <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">C</span>
                </div>
                <span className="text-lg font-bold text-emerald-900">CarbonCalc</span>
            </div>

            <nav className="flex-1 px-3 mt-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.view;
                    return (
                        <button
                            key={item.view}
                            onClick={() => navigate(item.view)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all ${
                                isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <item.icon size={18} />
                            <span className="flex-1 text-left">{item.label}</span>
                            {isActive && <ChevronRight size={16} />}
                        </button>
                    );
                })}
            </nav>

            <div className="px-3 pb-5">
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;