import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { 
  ChevronLeft, 
  Award,
  Car,
  Zap,
  Leaf,
  TreePine,
  Bike,
  Recycle,
  Sun,
  Droplets,
  Wind
} from 'lucide-react';
import type { User as UserType, View } from '../App';

interface EcoBadgesProps {
  user: NonNullable<UserType>;
  onNavigate: (view: View) => void;
}

export function EcoBadges({ user, onNavigate }: EcoBadgesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [badges, setBadges] = useState<{
    name: string;
    icon: string;
    description: string;
    earned: boolean;
    date?: string;
    progress?: number;
    target?: number;
    current?: number;
    color: string;
    bgColor: string;
  }[]>([]);

  const iconMap: Record<string, any> = { Car, Zap, TreePine, Leaf, Bike, Recycle, Sun, Droplets };

  useEffect(() => {
    const fetchBadgesData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/badges/${user.id}`);
        setBadges(res.data.badges || []);
      } catch {
        // Development fallback: use mock data when backend is unavailable
        setBadges([
          { name: 'Transport Pro', icon: 'Car', description: 'Reduced transport emissions by 50%', earned: true, date: 'Jan 5, 2026', color: 'bg-blue-500', bgColor: 'bg-blue-100' },
          { name: 'Energy Saver', icon: 'Zap', description: 'Saved 100 kWh of electricity', earned: true, date: 'Dec 28, 2025', color: 'bg-yellow-500', bgColor: 'bg-yellow-100' },
          { name: 'Tree Planter', icon: 'TreePine', description: 'Offset 1000 kg of CO₂', earned: true, date: 'Dec 15, 2025', color: 'bg-green-500', bgColor: 'bg-green-100' },
          { name: 'Tree Ranger', icon: 'Leaf', description: 'Offset 5000 kg of CO₂', earned: false, progress: 65, target: 5000, current: 3250, color: 'bg-emerald-500', bgColor: 'bg-emerald-100' },
          { name: 'Cycle Champion', icon: 'Bike', description: 'Cycled 100 km instead of driving', earned: false, progress: 45, target: 100, current: 45, color: 'bg-cyan-500', bgColor: 'bg-cyan-100' },
          { name: 'Recycling Hero', icon: 'Recycle', description: 'Recycled 50 kg of waste', earned: false, progress: 80, target: 50, current: 40, color: 'bg-purple-500', bgColor: 'bg-purple-100' },
          { name: 'Solar Star', icon: 'Sun', description: 'Generated 500 kWh from solar', earned: false, progress: 30, target: 500, current: 150, color: 'bg-orange-500', bgColor: 'bg-orange-100' },
          { name: 'Water Guardian', icon: 'Droplets', description: 'Saved 1000 liters of water', earned: false, progress: 55, target: 1000, current: 550, color: 'bg-sky-500', bgColor: 'bg-sky-100' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadgesData();
  }, [user.id]);

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

  const earnedCount = badges.filter(b => b.earned).length;
  const totalCount = badges.length;

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
      <div className="max-w-4xl mx-auto">
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
              Eco Badges
            </h1>
            <p className="text-sm text-eco-sage">Complete challenges to unlock badges</p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="eco-card p-6 mb-6 scroll-reveal">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-eco-green/10 rounded-full flex items-center justify-center">
              <Award className="w-10 h-10 text-eco-green" />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-heading font-bold text-eco-forest">{earnedCount}</span>
                <span className="text-lg text-eco-sage">/ {totalCount} badges earned</span>
              </div>
              <div className="h-3 bg-eco-bg-alt rounded-full overflow-hidden">
                <div 
                  className="h-full bg-eco-green rounded-full transition-all duration-500" 
                  style={{ width: `${(earnedCount / totalCount) * 100}%` }} 
                />
              </div>
              <p className="text-sm text-eco-sage mt-2">
                Keep going! You're doing great for the planet.
              </p>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 scroll-reveal">
          {badges.map((badge, index) => {
            const IconComponent = iconMap[badge.icon] || Leaf;
            return (
            <div 
              key={index}
              className={`eco-card p-5 transition-all hover:shadow-eco ${
                badge.earned ? '' : 'opacity-75'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 ${badge.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className={`w-7 h-7 ${badge.color.replace('bg-', 'text-')}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-bold text-eco-forest">{badge.name}</h3>
                    {badge.earned && (
                      <span className="text-xs px-2 py-0.5 bg-eco-success text-white rounded-full">
                        Earned
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-eco-sage mb-2">{badge.description}</p>
                  
                  {badge.earned ? (
                    <p className="text-xs text-eco-sage">
                      Earned on {badge.date}
                    </p>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-eco-sage">Progress</span>
                        <span className="font-medium text-eco-forest">{badge.progress}%</span>
                      </div>
                      <div className="h-2 bg-eco-bg-alt rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${badge.color} rounded-full transition-all duration-500`} 
                          style={{ width: `${badge.progress}%` }} 
                        />
                      </div>
                      <p className="text-xs text-eco-sage mt-1">
                        {badge.current?.toLocaleString()} / {badge.target?.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
          })}
        </div>

        {/* Coming Soon */}
        <div className="eco-card p-6 mt-6 scroll-reveal">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-eco-green/10 rounded-xl flex items-center justify-center">
              <Wind className="w-6 h-6 text-eco-green" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-bold text-eco-forest">More Badges Coming Soon</h3>
              <p className="text-sm text-eco-sage">Stay tuned for new challenges and achievements</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
