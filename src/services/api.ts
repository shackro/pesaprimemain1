// services/api.ts - Session-based version

// Types
export interface WalletData {
  balance: number;
  equity: number;
  currency: string;
}

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
  success: boolean;
  message: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  created_at: string;
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
  new_equity: number;
  transaction_id: string;
}

export interface ApiError {
  message: string;
  detail?: string;
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

export interface InvestmentRequest {
  asset_id: string;
  amount: number;
  phone_number: string;
  currency: string;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: 'crypto' | 'forex' | 'commodity' | 'stock';
  current_price: number;
  change_percentage: number;
  moving_average: number;
  trend: 'up' | 'down';
  chart_url: string;
  hourly_income: number;
  min_investment: number;
  duration: number;
}

export interface PnLData {
  profit_loss: number;
  percentage: number;
  trend: 'up' | 'down';
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://pesaprime-end-v4.onrender.com';
    console.log('API Base URL:', this.baseURL);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.detail || errorData.message || errorText);
      } catch {
        throw new Error(errorText || `HTTP error ${response.status}`);
      }
    }
    return response.json();
  }

  // Auth methods
  async register(userData: UserCreate): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      credentials: 'include',
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async login(loginData: UserLogin): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
      credentials: 'include',
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async getCurrentUser(): Promise<UserResponse> {
    const response = await fetch(`${this.baseURL}/api/auth/me`, {
      credentials: 'include',
    });
    return this.handleResponse<UserResponse>(response);
  }

  async logout(): Promise<void> {
    await fetch(`${this.baseURL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  async getPnL(): Promise<PnLData> {
    const response = await fetch(`${this.baseURL}/api/wallet/pnl`, {
      credentials: 'include',
    });
    return this.handleResponse<PnLData>(response);
  }

  // Wallet
  async getWalletBalance(phoneNumber: string): Promise<WalletData> {
    const response = await fetch(`${this.baseURL}/api/wallet/balance/${phoneNumber}`, {
      credentials: 'include',
    });
    return this.handleResponse<WalletData>(response);
  }

  async depositFunds(data: DepositRequest): Promise<TransactionResponse> {
    const response = await fetch(`${this.baseURL}/api/wallet/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return this.handleResponse<TransactionResponse>(response);
  }

  async withdrawFunds(data: WithdrawRequest): Promise<TransactionResponse> {
    const response = await fetch(`${this.baseURL}/api/wallet/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return this.handleResponse<TransactionResponse>(response);
  }

  // Investments
  async getMyInvestments(phoneNumber: string): Promise<UserInvestment[]> {
    const response = await fetch(`${this.baseURL}/api/investments/my/${phoneNumber}`, {
      credentials: 'include',
    });
    return this.handleResponse<UserInvestment[]>(response);
  }

  async buyInvestment(data: InvestmentRequest): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/investments/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return this.handleResponse<any>(response);
  }

  // Assets
  async getAssets(): Promise<Asset[]> {
    const response = await fetch(`${this.baseURL}/api/assets/market`, {
      credentials: 'include',
    });
    return this.handleResponse<Asset[]>(response);
  }

  // Activities
  async getMyActivities(phoneNumber: string): Promise<UserActivity[]> {
    const response = await fetch(`${this.baseURL}/api/activities/my/${phoneNumber}`, {
      credentials: 'include',
    });
    return this.handleResponse<UserActivity[]>(response);
  }

  // Health
  async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
    const response = await fetch(`${this.baseURL}/api/health`);
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
