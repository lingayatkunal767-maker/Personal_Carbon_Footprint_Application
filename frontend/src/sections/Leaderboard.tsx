import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import {
  ChevronLeft,
  Trophy,
  Medal,
  Award,
  Share2,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import type { User as UserType, View } from '../App';

interface LeaderboardProps {
  user: NonNullable<UserType>;
  onNavigate: (view: View) => void;
}

export function Leaderboard({ user, onNavigate }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const sectionRef = useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<{
    weekly: { rank: number; name: string; score: number; members: number; trend: string }[];
    monthly: { rank: number; name: string; score: number; members: number; trend: string }[];
    alltime: { rank: number; name: string; score: number; members: number; trend: string }[];
  }>({ weekly: [], monthly: [], alltime: [] });

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const res = await api.leaderboard.get();
        const mapped = res.entries.map(e => ({
          rank: e.rank, name: e.userName,
          score: Number(e.totalCarbonKg.toFixed(1)),
          members: 1, trend: 'same',
          isCurrentUser: e.isCurrentUser,
        }));
        setLeaderboardData({ weekly: mapped, monthly: mapped, alltime: mapped });
      } catch (e: any) {
        console.error('Leaderboard fetch failed:', e.message);
        setLeaderboardData({ weekly: [], monthly: [], alltime: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    const elements = sectionRef.current?.querySelectorAll('.scroll-reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-eco-sage">{rank}</span>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <span className="text-eco-success">↑</span>;
      case 'down':
        return <span className="text-eco-error">↓</span>;
      default:
        return <span className="text-eco-sage">−</span>;
    }
  };

  if (isLoading) {
    return (
      <section className="min-h-screen bg-eco-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-eco-green border-t-transparent rounded-full"></div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="min-h-screen bg-eco-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 scroll-reveal">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-eco-sage" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-eco-forest">
              Leaderboard
            </h1>
            <p className="text-sm text-eco-sage">Compete with teams worldwide</p>
          </div>
          <button
            onClick={() => toast.info('Invite feature coming soon!')}
            className="p-2 bg-eco-green text-white rounded-lg hover:bg-eco-forest transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 scroll-reveal">
          {(['weekly', 'monthly', 'alltime'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${
                activeTab === tab 
                  ? 'bg-eco-green text-white' 
                  : 'bg-white text-eco-sage hover:bg-eco-green/10'
              }`}
            >
              {tab === 'alltime' ? 'All Time' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Leaderboard Card */}
        <div className="eco-card p-6 scroll-reveal">
          {/* Top 3 Podium */}
          <div className="flex items-end justify-center gap-4 mb-8 pb-6 border-b border-eco-bg-alt">
            {leaderboardData[activeTab].slice(0, 3).map((team, index) => {
              const positions = [
                { height: 'h-24', order: 2 }, // 2nd place
                { height: 'h-32', order: 1 }, // 1st place
                { height: 'h-20', order: 3 }, // 3rd place
              ];
              const pos = positions[index];
              if (!pos) return null;
              return (
                <div
                  key={team.name}
                  className={`flex flex-col items-center ${pos.order === 1 ? 'order-1' : pos.order === 2 ? 'order-0' : 'order-2'}`}
                >
                  <div className="mb-2">
                    {getRankIcon(team.rank)}
                  </div>
                  <div className="text-sm font-medium text-eco-forest text-center mb-1">{team.name}</div>
                  <div className="text-lg font-bold text-eco-green">{team.score}</div>
                  <div className={`w-16 ${pos.height} bg-eco-green/20 rounded-t-lg mt-2`} />
                </div>
              );
            })}
          </div>

          {/* List */}
          <div className="space-y-2">
            {leaderboardData[activeTab].map((team) => (
              <div
                key={team.name}
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                  team.name === 'Team Green' 
                    ? 'bg-eco-green/10 border-2 border-eco-green/30' 
                    : 'hover:bg-eco-bg-alt'
                }`}
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(team.rank)}
                </div>

                <div className="w-10 h-10 bg-eco-green-pale rounded-full flex items-center justify-center">
                  <span className="text-lg">
                    {team.rank === 1 ? '🌿' : team.rank === 2 ? '🌍' : team.rank === 3 ? '♻️' : '🌱'}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-eco-forest">{team.name}</span>
                    {team.name === 'Team Green' && (
                      <span className="text-xs px-2 py-0.5 bg-eco-green text-white rounded-full">You</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-eco-sage">
                    <Users className="w-3 h-3" />
                    {team.members} members
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getTrendIcon(team.trend)}
                  <span className="font-bold text-eco-forest">{team.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite Friends CTA */}
        <div className="eco-card p-6 mt-6 scroll-reveal">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-eco-green/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-eco-green" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-bold text-eco-forest">Invite Friends</h3>
              <p className="text-sm text-eco-sage">Build a stronger team and climb the leaderboard</p>
            </div>
            <button
              onClick={() => toast.info('Invite feature coming soon!')}
              className="eco-button text-sm py-2 px-4"
            >
              Invite
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
