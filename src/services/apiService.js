// src/services/apiService.js
import {
  authAPI,
  userAPI,
  walletAPI,
  assetsAPI,
  investmentsAPI,
  activitiesAPI,
  bonusAPI,
  pnlAPI,
} from './api/endpoints';

class ApiService {
  // Authentication methods
  async login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      if (response.access_token) {
        localStorage.setItem('authToken', response.access_token);
        if (response.user) {
          localStorage.setItem('userData', JSON.stringify(response.user));
        }
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await authAPI.register(userData);
      if (response.access_token) {
        localStorage.setItem('authToken', response.access_token);
        if (response.user) {
          localStorage.setItem('userData', JSON.stringify(response.user));
        }
      }
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    return authAPI.logout();
  }

  // User methods
  async getCurrentUser() {
    try {
      const user = await userAPI.getProfile();
      localStorage.setItem('userData', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      // Return cached user data if available
      const cachedUser = localStorage.getItem('userData');
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }
      throw error;
    }
  }

  updateProfile(userData) {
    return userAPI.updateProfile(userData);
  }

  changePassword(passwordData) {
    return userAPI.changePassword(passwordData);
  }

  // Wallet methods
  async getWalletBalance() {
    try {
      return await walletAPI.getBalance();
    } catch (error) {
      console.error('Get wallet balance error:', error);
      // Return fallback data for development
      return {
        id: 0,
        user_id: 0,
        balance: 0,
        equity: 0,
        currency: 'KES',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  }

  async depositFunds(depositData) {
    try {
      const response = await walletAPI.deposit(depositData);
      return response;
    } catch (error) {
      console.error('Deposit error:', error);
      throw error;
    }
  }

  async withdrawFunds(withdrawData) {
    try {
      const response = await walletAPI.withdraw(withdrawData);
      return response;
    } catch (error) {
      console.error('Withdraw error:', error);
      throw error;
    }
  }

  // Assets methods
  async getAssets() {
    try {
      const assets = await assetsAPI.getMarketAssets();
      return assets;
    } catch (error) {
      console.error('Get assets error:', error);
      // Return empty array as fallback
      return [];
    }
  }

  async getMarketAssets() {
    return this.getAssets(); // Alias for consistency
  }

  async getAsset(assetId) {
    try {
      return await assetsAPI.getAsset(assetId);
    } catch (error) {
      console.error('Get asset error:', error);
      throw error;
    }
  }

  // Investments methods
  async getMyInvestments() {
    try {
      const investments = await investmentsAPI.getMyInvestments();
      return investments;
    } catch (error) {
      console.error('Get investments error:', error);
      // Return empty array as fallback
      return [];
    }
  }

  async buyInvestment(investmentData) {
    try {
      const response = await investmentsAPI.buyInvestment(investmentData);
      return response;
    } catch (error) {
      console.error('Buy investment error:', error);
      throw error;
    }
  }

  async sellInvestment(investmentId) {
    try {
      const response = await investmentsAPI.sellInvestment(investmentId);
      return response;
    } catch (error) {
      console.error('Sell investment error:', error);
      throw error;
    }
  }

  // Activities methods
  async getMyActivities() {
    try {
      const activities = await activitiesAPI.getMyActivities();
      return activities;
    } catch (error) {
      console.error('Get activities error:', error);
      // Return empty array as fallback
      return [];
    }
  }

  // Bonus methods
  async getAvailableBonuses() {
    try {
      return await bonusAPI.getAvailableBonuses();
    } catch (error) {
      console.error('Get bonuses error:', error);
      return [];
    }
  }

  async claimBonus(bonusId) {
    try {
      return await bonusAPI.claimBonus(bonusId);
    } catch (error) {
      console.error('Claim bonus error:', error);
      throw error;
    }
  }

  // P&L methods
  async getPnL() {
    try {
      return await pnlAPI.getPnL();
    } catch (error) {
      console.error('Get P&L error:', error);
      // Return default P&L data
      return {
        profit_loss: 0,
        percentage: 0,
        trend: 'up',
      };
    }
  }

  // Utility methods
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  getStoredUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }
}

// Create and export singleton instance
export const apiService = new ApiService();
export default apiService;