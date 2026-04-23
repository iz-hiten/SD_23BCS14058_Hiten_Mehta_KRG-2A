// Backend API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/api/health`,
  rateLimitStats: `${API_BASE_URL}/api/rate-limit-stats`,
  test: `${API_BASE_URL}/api/test`,
};

// Backend type: 'node' or 'spring'
export const BACKEND_TYPE = 'spring';

console.log(`🚀 Using ${BACKEND_TYPE.toUpperCase()} backend at ${API_BASE_URL}`);
