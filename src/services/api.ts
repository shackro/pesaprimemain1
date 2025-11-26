// src/services/api.ts
import axios from "axios";

// ===============================
// TYPES
// ===============================
export interface User {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  created_at: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserCreate {
  name: string;
  email: string;
  phone_number: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface WalletData {
  balance: number;
  equity: number;
  currency: string;
}

export interface DepositRequest {
  amount: number;
  phone_number: string;
}

export interface WithdrawRequest {
  amount: number;
  phone_number: string;
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  new_balance: number;
  transaction_id: string;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: string;
  current_price: number;
  change_percentage: number;
  moving_average: number;
  trend: string;
  chart_url: string;
  hourly_income: number;
  min_investment: number;
  duration: number;
}

export interface UserInvestment {
  id: string;
  user_phone: string;
  asset_id: string;
  asset_name: string;
  invested_amount: number;
  current_value: number;
  units: number;
  entry_price: number;
  current_price: number;
  profit_loss: number;
  profit_loss_percentage: number;
  status: string;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_phone: string;
  activity_type: string;
  amount: number;
  description: string;
  timestamp: string;
  status: string;
}

export interface PnLData {
  profit_loss: number;
  percentage: number;
  trend: string;
}

export interface InvestmentRequest {
  asset_id: string;
  amount: number;
  phone_number: string;
}

export interface Investment {
  id?: number;
  user_id: string;
  title: string;
  amount: number;
  category?: string;
}

// ===============================
// API SERVICE
// ===============================
class ApiService {
  private baseURL: string;

  constructor() {
    // Fixed the URL - removed the duplicate protocol
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://pesaprime-end-v3.onrender.com';
    console.log('🚀 API Service initialized with URL:', this.baseURL);
  }

  private getToken(): string | null {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  private setToken(token: string): void {
    try {
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  private removeToken(): void {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseURL}${path}`;
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      console.log(`📡 Making API request to: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || errorText;
        } catch {
          errorMessage = errorText || `HTTP error! status: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ API Request failed for ${url}:`, error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Cannot connect to server. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  // ===============================
  // AUTH METHODS
  // ===============================
  async register(userData: UserCreate): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.access_token) {
      this.setToken(data.access_token);
      localStorage.setItem('userData', JSON.stringify(data.user));
    }
    
    return data;
  }

  async login(loginData: UserLogin): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
    
    if (data.access_token) {
      this.setToken(data.access_token);
      localStorage.setItem('userData', JSON.stringify(data.user));
    }
    
    return data;
  }

  logout(): void {
    this.removeToken();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  // ===============================
  // WALLET METHODS
  // ===============================
  async getWalletBalance(): Promise<WalletData> {
    return this.request<WalletData>('/api/wallet/balance');
  }

  async depositFunds(depositData: DepositRequest): Promise<TransactionResponse> {
    return this.request<TransactionResponse>('/api/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify(depositData),
    });
  }

  async withdrawFunds(withdrawData: WithdrawRequest): Promise<TransactionResponse> {
    return this.request<TransactionResponse>('/api/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(withdrawData),
    });
  }

  // ===============================
  // ASSET METHODS
  // ===============================
  async getMarketAssets(): Promise<Asset[]> {
    return this.request<Asset[]>('/api/assets/market');
  }

  // ===============================
  // INVESTMENT METHODS
  // ===============================
  async getMyInvestments(): Promise<UserInvestment[]> {
    return this.request<UserInvestment[]>('/api/investments/my');
  }

  async buyInvestment(investmentData: InvestmentRequest): Promise<{
    success: boolean;
    message: string;
    investment: UserInvestment;
    new_balance: number;
  }> {
    return this.request('/api/investments/buy', {
      method: 'POST',
      body: JSON.stringify(investmentData),
    });
  }

  // ===============================
  // ACTIVITY METHODS
  // ===============================
  async getMyActivities(): Promise<UserActivity[]> {
    return this.request<UserActivity[]>('/api/activities/my');
  }

  // ===============================
  // PnL METHODS
  // ===============================
  async getCurrentPnL(): Promise<PnLData> {
    return this.request<PnLData>('/api/pnl/current');
  }

  // ===============================
  // UTILITY METHODS
  // ===============================
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/api/health');
  }

  async serverHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  getCurrentUserPhone(): string | null {
    const user = this.getStoredUser();
    return user ? user.phone_number : null;
  }
}

// ===============================
// LEGACY INVESTMENT FUNCTIONS (axios-based)
// ===============================
const LEGACY_API_URL = "https://pesaprime-end-v3.onrender.com";

export const createInvestment = async (data: Investment) => {
  try {
    const res = await axios.post(`${LEGACY_API_URL}/investments/`, data);
    return res.data;
  } catch (error) {
    console.error('Error creating investment:', error);
    throw error;
  }
};

export const getInvestments = async (): Promise<Investment[]> => {
  try {
    const res = await axios.get(`${LEGACY_API_URL}/investments/`);
    return res.data;
  } catch (error) {
    console.error('Error getting investments:', error);
    throw error;
  }
};

export const getInvestment = async (id: number): Promise<Investment> => {
  try {
    const res = await axios.get(`${LEGACY_API_URL}/investments/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error getting investment:', error);
    throw error;
  }
};

export const updateInvestment = async (id: number, data: Partial<Investment>): Promise<Investment> => {
  try {
    const res = await axios.put(`${LEGACY_API_URL}/investments/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('Error updating investment:', error);
    throw error;
  }
};

export const deleteInvestment = async (id: number): Promise<{ message: string }> => {
  try {
    const res = await axios.delete(`${LEGACY_API_URL}/investments/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting investment:', error);
    throw error;
  }
};

// ===============================
// ERROR HANDLER
// ===============================
export class ApiErrorHandler {
  static handle(error: any, context: string = ''): string {
    console.error(`API Error in ${context}:`, error);
    
    if (error instanceof Error) {
      if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        return 'Unable to connect to server. Please check your internet connection.';
      }
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        return 'Your session has expired. Please login again.';
      }
      if (error.message.includes('404')) {
        return 'Requested resource not found.';
      }
      if (error.message.includes('500')) {
        return 'Server error. Please try again later.';
      }
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  }
}

// ===============================
// EXPORT SINGLETON
// ===============================
export const apiService = new ApiService();
export default apiService;
