import { useEffect, useRef, useState } from 'react';
// api imported below if needed
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
      // Badges endpoint will be added in a future backend update.
      // For now show empty state — no mock data.
      setBadges([]);
      setIsLoading(false);
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
