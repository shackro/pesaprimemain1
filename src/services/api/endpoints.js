// src/services/api/endpoints.js
import apiClient from './client';

// Authentication endpoints
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh'),
  verifyToken: () => apiClient.get('/auth/verify'),
};

// User endpoints
export const userAPI = {
  getProfile: () => apiClient.get('/users/me'),
  updateProfile: (userData) => apiClient.put('/users/me', userData),
  changePassword: (passwordData) => apiClient.post('/users/change-password', passwordData),
};

// Wallet endpoints
export const walletAPI = {
  getBalance: () => apiClient.get('/wallet/balance'),
  getTransactions: (params = {}) => apiClient.get('/wallet/transactions', { params }),
  deposit: (depositData) => apiClient.post('/wallet/deposit', depositData),
  withdraw: (withdrawData) => apiClient.post('/wallet/withdraw', withdrawData),
};

// Assets endpoints
export const assetsAPI = {
  getMarketAssets: (params = {}) => apiClient.get('/assets/market', { params }),
  getAsset: (assetId) => apiClient.get(`/assets/${assetId}`),
  getAssetHistory: (assetId, timeframe = '1h') => 
    apiClient.get(`/assets/${assetId}/history`, { params: { timeframe } }),
};

// Investments endpoints
export const investmentsAPI = {
  getMyInvestments: () => apiClient.get('/investments/my'),
  buyInvestment: (investmentData) => apiClient.post('/investments/buy', investmentData),
  sellInvestment: (investmentId) => apiClient.post(`/investments/${investmentId}/sell`),
  getInvestmentHistory: () => apiClient.get('/investments/history'),
};

// Activities endpoints
export const activitiesAPI = {
  getMyActivities: (params = {}) => apiClient.get('/activities/my', { params }),
  getActivityStats: () => apiClient.get('/activities/stats'),
};

// Bonus endpoints
export const bonusAPI = {
  getAvailableBonuses: () => apiClient.get('/bonus/available'),
  claimBonus: (bonusId) => apiClient.post(`/bonus/${bonusId}/claim`),
  getBonusHistory: () => apiClient.get('/bonus/history'),
};

// P&L endpoints
export const pnlAPI = {
  getPnL: () => apiClient.get('/pnl/current'),
  getPnLHistory: (timeframe = '24h') => apiClient.get('/pnl/history', { params: { timeframe } }),
};