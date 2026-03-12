// All API calls go to Spring Boot at localhost:8080
const BASE = 'http://localhost:8080/api';

function getToken() { return localStorage.getItem('carboncalc_token'); }

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    login:          (email: string, password: string) =>
      req<{ token: string; user: UserDto }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register:       (name: string, email: string, password: string) =>
      req('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
    verifyOtp:      (email: string, otp: string) =>
      req('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
    resendOtp:      (email: string) =>
      req('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }),
    forgotPassword: (email: string) =>
      req('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword:  (email: string, otp: string, newPassword: string) =>
      req('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) }),
  },

  // period: 'daily' | 'weekly' | 'monthly'
  dashboard: {
    get: (period: 'daily' | 'weekly' | 'monthly' = 'monthly') =>
      req<DashboardDto>(`/dashboard?period=${period}`),
  },

  carbon: {
    getAll:      ()                        => req<CarbonEntryDto[]>('/carbon'),
    getRange:    (from: string, to: string) => req<CarbonEntryDto[]>(`/carbon/range?start=${from}&end=${to}`),
    create:      (d: CarbonEntryReq)       => req<CarbonEntryDto>('/carbon', { method: 'POST', body: JSON.stringify(d) }),
    update:      (id: number, d: CarbonEntryReq) =>
      req<CarbonEntryDto>(`/carbon/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    delete:      (id: number)              => req(`/carbon/${id}`, { method: 'DELETE' }),
  },

  goals: {
    getAll:         () => req<GoalDto[]>('/goals'),
    create:         (d: GoalReq) => req<GoalDto>('/goals', { method: 'POST', body: JSON.stringify(d) }),
    updateProgress: (id: number, progress: number) =>
      req<GoalDto>(`/goals/${id}/progress`, { method: 'PATCH', body: JSON.stringify({ progress }) }),
    delete:         (id: number) => req(`/goals/${id}`, { method: 'DELETE' }),
  },

  leaderboard: { get: () => req<LeaderboardDto>('/leaderboard') },

  survey: {
    get:  () => req<SurveyDto | null>('/survey'),
    save: (d: Partial<SurveyDto> & { fuelType?: string; eatingOutFrequency?: string }) =>
      req<SurveyDto>('/survey', { method: 'POST', body: JSON.stringify(d) }),
  },
};

// ── DTOs ──────────────────────────────────────────────────────────────────────
export interface UserDto {
  id: number; name: string; email: string; role: string; memberSince?: string;
}

export interface DashboardDto {
  userName: string; memberSince: string;
  totalCarbonKg: number;
  thisMonthCarbonKg: number; lastMonthCarbonKg: number; monthlyChangePercent: number;
  periodCarbonKg: number; periodLabel: string;
  categoryBreakdown: Record<string, number>;
  weeklyTrend: { date: string; amount: number }[];
  activeGoals: number; completedGoals: number; totalBadges: number; leaderboardRank: number;
  estimatedAnnualFootprint?: number;
}

export interface CarbonEntryDto {
  id: number; category: string; activity: string; amount: number;
  unit: string; notes: string; date: string; createdAt: string;
}

export interface CarbonEntryReq {
  category: string; activity: string; amount: number;
  unit?: string; notes?: string; date: string;
}

export interface GoalDto {
  id: number; title: string; description: string; category: string;
  targetAmount: number; currentProgress: number; progressPercentage: number;
  deadline: string; status: string; createdAt: string;
}

export interface GoalReq {
  title: string; description?: string; category: string;
  targetAmount: number; deadline: string;
}

export interface LeaderboardDto {
  entries: {
    rank: number; userId: number; userName: string;
    totalCarbonKg: number; badgeCount: number; isCurrentUser: boolean;
  }[];
  currentUserRank: number; currentUserTotal: number;
}

export interface SurveyDto {
  id?: number;
  primaryTransport?: string; weeklyDrivingKm?: number;
  carType?: string; fuelType?: string;
  homeHeating?: string; monthlyElectricityKwh?: number; hasRenewableEnergy?: boolean;
  dietType?: string; meatMealsPerWeek?: number; buysLocalFood?: boolean;
  eatingOutFrequency?: string;
  shoppingHabits?: string; buysSecondHand?: boolean;
  shortFlightsPerYear?: number; longFlightsPerYear?: number;
  estimatedAnnualFootprint?: number;
}
