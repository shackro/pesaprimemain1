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

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://127.0.0.1:8002/investments"
    : "https://pesaprime-end-v3.onrender.com";

// ------------ TYPES ------------
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
  getPnL: any;
  getMarketAssets(): Asset[] | PromiseLike<Asset[]> {
    throw new Error('Method not implemented.');
  }
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://https://pesaprime-end-v3.onrender.com';
  }

  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  private removeToken(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
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
  async getAssets(): Promise<Asset[]> {
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
    return this.request('/health');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getStoredUser(): User | null {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
}

export const createInvestment = async (data: Investment) => {
  const res = await axios.post(API_URL + "/", data);
  return res.data;
};

export const getInvestments = async () => {
  const res = await axios.get(API_URL + "/");
  return res.data as Investment[];
};

export const getInvestment = async (id: number) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data as Investment;
};

export const updateInvestment = async (id: number, data: Partial<Investment>) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};

export const deleteInvestment = async (id: number) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};


// ===============================
// EXPORT SINGLETON
// ===============================
export const apiService = new ApiService();
export default apiService;