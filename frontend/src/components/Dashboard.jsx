import React from 'react';
import { 
  LogOut, 
  Leaf, 
  Trophy, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Car, 
  TreePine 
} from 'lucide-react';

const Dashboard = () => {
  // Mock data - in a real app, you'd fetch this from localStorage or an API
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'John Doe', email: 'john@email.com' };

  return (
    <div className="min-h-screen bg-[#F1F7F0] font-sans pb-10">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-green-600 p-1.5 rounded-lg">
            <Leaf className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-gray-800 tracking-tight">EcoTrack</span>
        </div>
        <button 
          onClick={() => { localStorage.clear(); window.location.href = '/'; }}
          className="flex items-center gap-2 bg-[#5E8C61] hover:bg-[#4A6E4D] text-white px-5 py-2 rounded-lg transition-colors font-semibold"
        >
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-8">
        {/* Hero Section */}
        <section className="mb-10">
          <h1 className="text-4xl font-bold text-[#2D4A31]">Welcome back, {user.username.split(' ')[0]}!</h1>
          <p className="text-gray-600 mt-1 text-lg">Your Carbon Footprint Tracker</p>
        </section>

        {/* Top Grid: Profile & Goals */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
          {/* Profile Card */}
          <div className="md:col-span-5 bg-white rounded-3xl p-8 shadow-sm border border-green-100 flex items-center gap-6">
            <div className="w-24 h-24 bg-[#DDEEE0] rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-inner">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <p className="text-gray-400 text-xs mt-2 uppercase tracking-wider font-semibold">Member Since: Jan 12, 2022</p>
            </div>
          </div>

          {/* Goals Card */}
          <div className="md:col-span-7 bg-white rounded-3xl p-8 shadow-sm border border-green-100">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">Your Goals</h3>
            </div>
            <p className="text-[#4A6E4D] font-medium mb-3">Reduce Monthly Emission by 20%</p>
            <div className="w-full bg-gray-100 h-4 rounded-full mb-6 overflow-hidden">
              <div className="bg-[#5E8C61] h-full w-[40%] rounded-full shadow-sm"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-green-700 font-bold">
                  <Leaf size={20} /> 40%
                </div>
                <ShieldCheck className="text-green-500" />
                <div className="text-green-600 font-bold">$</div>
              </div>
              <button className="bg-[#5E8C61] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-[#4A6E4D] transition">
                Manage Goals <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Stats, Leaderboard, Badges */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Chart Section */}
          <div className="md:col-span-6 bg-white rounded-3xl shadow-sm border border-green-100 overflow-hidden">
            <div className="p-8 pb-0">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold text-gray-800">Carbon Footprint Log</h3>
                 <button className="text-xs font-bold text-gray-500 border px-3 py-1 rounded-full uppercase tracking-tighter">All Last Week</button>
               </div>
               <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-bold text-[#2D4A31]">348</span>
                 <span className="text-gray-500 font-medium text-lg">kg CO₂e / Week</span>
                 <span className="text-red-500 text-sm font-bold ml-2">+12% from last week</span>
               </div>
            </div>
            {/* Visual placeholder for the graph */}
            <div className="h-48 mt-4 bg-gradient-to-t from-green-50 to-transparent relative flex items-end px-8">
               <div className="w-full h-32 border-b-2 border-green-200 relative">
                  {/* Mock line path */}
                  <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,80 L25,70 L50,55 L75,45 L100,30" fill="none" stroke="#5E8C61" strokeWidth="2" />
                  </svg>
               </div>
            </div>
            <div className="flex justify-between p-4 bg-gray-50/50 border-t border-green-50">
              <button className="text-green-700 text-sm font-bold hover:underline">View Full History</button>
              <button className="text-green-700 text-sm font-bold hover:underline">View Full History</button>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="md:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-green-100 flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Leaderboard</h3>
            <div className="space-y-5 flex-grow">
              {[
                { name: 'Team Green', score: 845, icon: 'text-green-500' },
                { name: 'Team Earth', score: 720, icon: 'text-orange-400' },
                { name: 'Team Eco', score: 690, icon: 'text-green-300' }
              ].map((team, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Trophy className={`${team.icon}`} size={18} />
                    <span className="font-semibold text-gray-700">{team.name}</span>
                  </div>
                  <span className="text-gray-500 font-mono font-bold">{team.score}</span>
                </div>
              ))}
            </div>
            <button className="mt-8 text-green-700 text-sm font-bold hover:underline text-center">View Leaderboard</button>
          </div>

          {/* Eco Badges */}
          <div className="md:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-green-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Eco Badges</h3>
            <div className="grid grid-cols-2 gap-4">
              <BadgeItem Icon={Car} label="Transport Pro" />
              <BadgeItem Icon={Zap} label="Energy Saver" />
              <BadgeItem Icon={Leaf} label="Tree Planter" />
              <BadgeItem Icon={TreePine} label="Tree Runner" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const BadgeItem = ({ Icon, label }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="w-14 h-16 bg-[#F1F7F0] border-2 border-green-200 rounded-xl flex items-center justify-center text-green-600 shadow-sm">
      <Icon size={28} />
    </div>
    <span className="text-[10px] uppercase font-bold text-gray-500 text-center leading-tight">{label}</span>
  </div>
);

export default Dashboard;