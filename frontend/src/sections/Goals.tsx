import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { 
  ChevronLeft, 
  Target,
  Leaf,
  TrendingDown,
  CheckCircle2,
  Circle,
  Plus,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import type { User as UserType, View } from '../App';

interface GoalsProps {
  user: NonNullable<UserType>;
  onNavigate: (view: View) => void;
}

export function Goals({ user, onNavigate }: GoalsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGoal, setCurrentGoal] = useState<{
    title: string;
    progress: number;
    current: number;
    target: number;
    unit: string;
    saved: number;
    deadline: string;
  } | null>(null);
  const [milestones, setMilestones] = useState<{ title: string; completed: boolean; date: string }[]>([]);
  const [pastGoals, setPastGoals] = useState<{ title: string; achieved: boolean; final: string }[]>([]);

  useEffect(() => {
    const fetchGoalsData = async () => {
      try {
        const goals = await api.goals.getAll();
        const active = goals.find(g => g.status === 'ACTIVE');
        if (active) {
          setCurrentGoal({
            title: active.title,
            progress: active.progressPercentage,
            current: active.currentProgress,
            target: active.targetAmount,
            unit: 'kg CO₂e',
            saved: 0,
            deadline: active.deadline,
          });
        } else {
          setCurrentGoal(null);
        }
        setMilestones([]);
        setPastGoals(
          goals.filter(g => g.status !== 'ACTIVE').map(g => ({
            title: g.title,
            achieved: g.status === 'COMPLETED',
            final: `${g.currentProgress.toFixed(1)} / ${g.targetAmount} kg`,
          }))
        );
      } catch (e: any) {
        console.error('Goals fetch failed:', e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoalsData();
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
              Your Goals
            </h1>
            <p className="text-sm text-eco-sage">Track your eco-commitments</p>
          </div>
        </div>

        {/* Current Goal Card */}
        <div className="eco-card p-6 mb-6 scroll-reveal">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-eco-green/10 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-eco-green" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-eco-forest">Current Goal</h3>
                <p className="text-xs text-eco-sage">{currentGoal?.deadline}</p>
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-eco-green bg-eco-green/10 rounded-lg hover:bg-eco-green/20 transition-colors"
              >
                Manage
                <ChevronDown className="w-4 h-4" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-eco border border-[rgba(61,139,93,0.22)] py-2 z-10">
                  <button 
                    onClick={() => { toast.info('Edit goal feature coming soon!'); setShowDropdown(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-eco-forest hover:bg-eco-bg-alt transition-colors"
                  >
                    Edit Goal
                  </button>
                  <button 
                    onClick={() => { toast.info('New goal feature coming soon!'); setShowDropdown(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-eco-forest hover:bg-eco-bg-alt transition-colors"
                  >
                    Set New Goal
                  </button>
                </div>
              )}
            </div>
          </div>

          <h4 className="text-lg font-medium text-eco-forest mb-4">{currentGoal?.title}</h4>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-eco-sage">Progress</span>
              <span className="text-lg font-bold text-eco-green">{currentGoal?.progress}%</span>
            </div>
            <div className="h-4 bg-eco-bg-alt rounded-full overflow-hidden">
              <div 
                className="h-full bg-eco-green rounded-full transition-all duration-500 relative"
                style={{ width: `${currentGoal?.progress || 0}%` }} 
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-eco-bg-alt rounded-xl">
              <Leaf className="w-5 h-5 text-eco-green mx-auto mb-1" />
              <p className="text-lg font-bold text-eco-forest">{currentGoal?.progress}%</p>
              <p className="text-xs text-eco-sage">Completed</p>
            </div>
            <div className="text-center p-3 bg-eco-bg-alt rounded-xl">
              <TrendingDown className="w-5 h-5 text-eco-success mx-auto mb-1" />
              <p className="text-lg font-bold text-eco-forest">{currentGoal?.current}</p>
              <p className="text-xs text-eco-sage">Current (kg)</p>
            </div>
            <div className="text-center p-3 bg-eco-bg-alt rounded-xl">
              <span className="text-lg">💰</span>
              <p className="text-lg font-bold text-eco-forest">₹{currentGoal?.saved}</p>
              <p className="text-xs text-eco-sage">Saved</p>
            </div>
          </div>

          {/* Milestones */}
          <div className="border-t border-eco-bg-alt pt-4">
            <h5 className="text-sm font-medium text-eco-forest mb-3">Milestones</h5>
            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-3">
                  {milestone.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-eco-success flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-eco-sage flex-shrink-0" />
                  )}
                  <span className={`text-sm ${milestone.completed ? 'text-eco-forest' : 'text-eco-sage'}`}>
                    {milestone.title}
                  </span>
                  <span className="text-xs text-eco-sage ml-auto">{milestone.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Past Goals */}
        <div className="eco-card p-6 scroll-reveal">
          <h3 className="font-heading font-bold text-eco-forest mb-4">Past Goals</h3>
          <div className="space-y-3">
            {pastGoals.map((goal, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 p-3 bg-eco-bg-alt/50 rounded-xl"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  goal.achieved ? 'bg-eco-success/20' : 'bg-eco-error/20'
                }`}>
                  {goal.achieved ? (
                    <CheckCircle2 className="w-5 h-5 text-eco-success" />
                  ) : (
                    <Circle className="w-5 h-5 text-eco-error" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-eco-forest">{goal.title}</p>
                  <p className="text-xs text-eco-sage">{goal.final}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  goal.achieved ? 'bg-eco-success text-white' : 'bg-eco-error/20 text-eco-error'
                }`}>
                  {goal.achieved ? 'Achieved' : 'Missed'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* New Goal CTA */}
        <button 
          onClick={() => toast.info('New goal feature coming soon!')}
          className="w-full mt-6 py-4 border-2 border-dashed border-eco-green/30 rounded-xl text-eco-green hover:bg-eco-green/5 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Set a New Goal
        </button>
      </div>
    </section>
  );
}
