// API Service for Backend Communication
// Base URL - update this when deploying to production

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiClientError extends Error {
  constructor({ message, status = 0, error = '', path = '', errors = {} }) {
    super(message || 'Request failed');
    this.name = 'ApiClientError';
    this.status = status;
    this.error = error;
    this.path = path;
    this.errors = errors;
  }
}

function isJsonContentType(contentType) {
  return typeof contentType === 'string' && contentType.toLowerCase().includes('application/json');
}

function normalizeErrorsMap(rawErrors) {
  if (!rawErrors || typeof rawErrors !== 'object' || Array.isArray(rawErrors)) {
    return {};
  }

  const output = {};
  Object.entries(rawErrors).forEach(([key, value]) => {
    if (value == null) return;
    output[String(key)] = String(value);
  });
  return output;
}

function deriveMessageFromErrors(errorsMap) {
  const entries = Object.entries(errorsMap);
  if (entries.length === 0) return '';
  const [field, message] = entries[0];
  return field && field !== 'request' ? `${field}: ${message}` : message;
}

function buildApiErrorPayload(payload, status = 0, statusText = 'Request failed', fallbackPath = '') {
  const errors = normalizeErrorsMap(payload?.errors);
  const message =
    payload?.message ||
    deriveMessageFromErrors(errors) ||
    payload?.error ||
    statusText ||
    'Request failed';

  return {
    message: String(message),
    status: Number(status) || 0,
    error: String(payload?.error || statusText || 'Request failed'),
    path: String(payload?.path || fallbackPath || ''),
    errors,
  };
}

function isNetworkFailure(error) {
  const message = String(error?.message || '');
  return /failed to fetch|networkerror|load failed|network request failed/i.test(message);
}

export function extractApiErrorMessage(error, fallback = 'Request failed') {
  if (error instanceof ApiClientError && error.message) {
    return error.message;
  }

  const status = Number(error?.response?.status || 0);
  const responseData = error?.response?.data;
  if (status && responseData && typeof responseData === 'object') {
    const parsed = buildApiErrorPayload(responseData, status, error?.response?.statusText || '', '');
    if (parsed.message) return parsed.message;
  }

  if (isNetworkFailure(error)) {
    return 'Cannot reach backend server. Start backend and try again.';
  }

  if (error?.message) {
    return String(error.message);
  }

  return fallback;
}

export const fetchAPI = async (endpoint, options = {}) => {
  const {
    parseAs = 'json',
    treatSuccessFalseAsError = true,
    ...fetchOptions
  } = options;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const isFormDataBody = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
  const mergedHeaders = {
    ...defaultHeaders,
    ...fetchOptions.headers,
  };
  if (isFormDataBody) {
    delete mergedHeaders['Content-Type'];
  }

  const config = {
    ...fetchOptions,
    headers: mergedHeaders,
  };

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      let payload = null;

      if (isJsonContentType(contentType)) {
        payload = await response.json().catch(() => null);
      } else {
        const textBody = await response.text().catch(() => '');
        payload = textBody ? { message: textBody } : null;
      }

      throw new ApiClientError(
        buildApiErrorPayload(payload, response.status, response.statusText, endpoint)
      );
    }

    if (parseAs === 'raw') return response;
    if (response.status === 204 || parseAs === 'none') return null;
    if (parseAs === 'text') return await response.text();
    if (parseAs === 'blob') return await response.blob();

    const data = await response.json();
    if (treatSuccessFalseAsError && data && typeof data === 'object' && data.success === false) {
      throw new ApiClientError(
        buildApiErrorPayload(data, response.status, response.statusText, endpoint)
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    if (isNetworkFailure(error)) {
      throw new ApiClientError({
        message: 'Cannot reach backend server. Start backend and try again.',
        status: 0,
        error: 'Network Error',
        path: endpoint,
        errors: {},
      });
    }

    throw new ApiClientError({
      message: extractApiErrorMessage(error, 'Request failed'),
      status: Number(error?.status || 0),
      error: 'Request Error',
      path: endpoint,
      errors: {},
    });
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
  exportCarbonLogs: async () => fetchAPI('/admin/carbon-logs/export', { parseAs: 'text' }),
  deleteCarbonLog: async (logId) => fetchAPI(`/admin/carbon-logs/${logId}`, { method: 'DELETE' }),
  updateCarbonLog: async (logId, payload) => fetchAPI(`/admin/carbon-logs/${logId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
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



