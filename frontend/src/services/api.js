// API Service for Backend Communication
// Base URL - update this when deploying to production

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function for API calls
const fetchAPI = async (endpoint, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    // Handle empty responses (like DELETE)
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// User APIs
export const userAPI = {
  // Get user by ID
  getUser: async (userId) => {
    return fetchAPI(`/users/${userId}`);
  },

  // Get user by email
  getUserByEmail: async (email) => {
    return fetchAPI(`/users/email/${encodeURIComponent(email)}`);
  },

  // Create new user
  createUser: async (userData) => {
    return fetchAPI('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Update user
  updateUser: async (userId, userData) => {
    return fetchAPI(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// Carbon Activity APIs
export const activityAPI = {
  // Get all activities for a user
  getUserActivities: async (userId) => {
    return fetchAPI(`/activities/user/${userId}`);
  },

  // Create new activity
  createActivity: async (activityData) => {
    return fetchAPI('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  },

  // Delete activity
  deleteActivity: async (activityId) => {
    return fetchAPI(`/activities/${activityId}`, {
      method: 'DELETE',
    });
  },

  // Get activities by date range
  getActivitiesByDateRange: async (userId, startDate, endDate) => {
    return fetchAPI(`/activities/user/${userId}/range?start=${startDate}&end=${endDate}`);
  },
};

// Goal APIs
export const goalAPI = {
  // Get all goals for a user
  getUserGoals: async (userId) => {
    return fetchAPI(`/goals/user/${userId}`);
  },

  // Create new goal
  createGoal: async (goalData) => {
    return fetchAPI('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  },

  // Update goal
  updateGoal: async (goalId, goalData) => {
    return fetchAPI(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
  },

  // Delete goal
  deleteGoal: async (goalId) => {
    return fetchAPI(`/goals/${goalId}`, {
      method: 'DELETE',
    });
  },
};

// Badge APIs
export const badgeAPI = {
  // Get all badges for a user
  getUserBadges: async (userId) => {
    return fetchAPI(`/badges/user/${userId}`);
  },
};

// Leaderboard APIs
export const leaderboardAPI = {
  // Get global leaderboard
  getLeaderboard: async (limit = 10) => {
    return fetchAPI(`/leaderboard?limit=${limit}`);
  },
};

// Statistics APIs
export const statsAPI = {
  // Get user statistics summary
  getUserStats: async (userId) => {
    return fetchAPI(`/stats/user/${userId}`);
  },

  // Get monthly comparison
  getMonthlyComparison: async (userId, months = 6) => {
    return fetchAPI(`/stats/user/${userId}/monthly?months=${months}`);
  },

  // Get emissions breakdown
  getEmissionsBreakdown: async (userId) => {
    return fetchAPI(`/stats/user/${userId}/breakdown`);
  },
};

// Survey APIs
export const surveyAPI = {
  // Submit lifestyle survey
  submitSurvey: async (surveyData) => {
    return fetchAPI('/survey', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    });
  },

  // Get dataset-backed tips and benchmarks for a user
  getDatasetInsights: async (userId) => {
    return fetchAPI(`/survey/insights/user/${userId}`);
  },
};

// Carbon Log APIs
export const carbonLogAPI = {
  // Get carbon logs for a user
  getCarbonLogs: async (userId, from = null, to = null) => {
    let url = `/carbon/logs?userId=${userId}`;
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;
    return fetchAPI(url);
  },

  // Update carbon log by date
  updateCarbonLogByDate: async (userId, logDate, logData) => {
    return fetchAPI(`/carbon/logs/${logDate}?userId=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(logData),
    });
  },

  // Delete carbon log by date
  deleteCarbonLogByDate: async (userId, logDate) => {
    return fetchAPI(`/carbon/logs/${logDate}?userId=${userId}`, {
      method: 'DELETE',
    });
  },
};

// Dashboard APIs
export const dashboardAPI = {
  // Get complete dashboard data
  getDashboard: async (userId) => {
    return fetchAPI(`/dashboard/user/${userId}`);
  },
};

// Authentication APIs
export const authAPI = {
  // Google OAuth login
  googleAuth: async (googleData) => {
    return fetchAPI('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData),
    });
  },

  // Email/Password login
  login: async (credentials) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Register new user
  register: async (userData) => {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Admin login
  adminLogin: async (credentials) => {
    return fetchAPI('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Admin register
  adminRegister: async (adminData) => {
    return fetchAPI('/auth/admin/register', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  },
};

// Admin APIs
export const adminAPI = {
  getUsers: async () => fetchAPI('/admin/users'),
  updateUserStatus: async (userId, active) => fetchAPI(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  }),
  getSurveyMonitoring: async () => fetchAPI('/admin/surveys/monitor'),
  getCarbonLogs: async () => fetchAPI('/admin/carbon-logs'),
  deleteCarbonLog: async (logId) => fetchAPI(`/admin/carbon-logs/${logId}`, { method: 'DELETE' }),
  getEmissionFactors: async () => fetchAPI('/admin/emission-factors'),
  upsertEmissionFactor: async (payload) => fetchAPI('/admin/emission-factors', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  getAnalytics: async (months = 6) => fetchAPI(`/admin/analytics?months=${months}`),
  getBadgeDefinitions: async () => fetchAPI('/admin/badges/definitions'),
  upsertBadgeDefinition: async (payload) => fetchAPI('/admin/badges/definitions', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  assignBadge: async (payload) => fetchAPI('/admin/badges/assign', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  assignByPerformance: async (minReductionPercent = 10) => fetchAPI(`/admin/badges/assign-by-performance?minReductionPercent=${minReductionPercent}`, {
    method: 'POST',
  }),
};


// Marketplace APIs
export const marketplaceAPI = {
  getProducts: async () => fetchAPI('/marketplace/products'),
  getProductsByCategory: async (category) => fetchAPI(`/marketplace/products/category/${category}`),
  createOrder: async (orderData) => fetchAPI('/marketplace/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  getUserOrders: async (userId) => fetchAPI(`/marketplace/orders/user/${userId}`),
  cancelOrder: async (orderId) => fetchAPI(`/marketplace/orders/${orderId}/cancel`, { method: 'PUT' }),
};


// Export all as a single object (alternative usage)
export const api = {
  user: userAPI,
  activity: activityAPI,
  goal: goalAPI,
  badge: badgeAPI,
  leaderboard: leaderboardAPI,
  stats: statsAPI,
  survey: surveyAPI,
  carbonLog: carbonLogAPI,
  dashboard: dashboardAPI,
  auth: authAPI,
  admin: adminAPI,
  marketplace: marketplaceAPI,
};

// Default export
export default api;



