// frontend/src/services/api.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

// ===============================
// TYPES
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
  id: number;
  user_phone?: string;
  user_id?: string;
  asset_id?: string;
  asset_name?: string;
  invested_amount?: number;
  current_value?: number;
  units?: number;
  entry_price?: number;
  current_price?: number;
  profit_loss?: number;
  profit_loss_percentage?: number;
  status?: string;
  created_at?: string;
}

export interface UserActivity {
  id: number;
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
// ApiService class (no tokens)
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || "https://pesaprime-end-v3.onrender.com";
    console.log("🚀 API Service initialized with URL:", this.baseURL);
  }

  // no token logic (Option C)
  private getUrl(path: string) {
    return `${this.baseURL}${path.startsWith("/") ? path : "/" + path}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = this.getUrl(endpoint);
    try {
      const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
      if (!res.ok) {
        const txt = await res.text();
        let msg = `HTTP ${res.status}`;
        try {
          const j = JSON.parse(txt);
          msg = j.detail || j.message || txt;
        } catch {}
        throw new Error(msg);
      }
      if (res.status === 204) return {} as T;
      return (await res.json()) as T;
    } catch (err: any) {
      console.error("API request failed:", endpoint, err);
      throw err;
    }
  }

  // AUTH (no JWT)
  async register(userData: UserCreate): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(loginData: UserLogin): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(loginData),
    });
  }

  // WALLET
  async getWalletBalance(phone_number: string): Promise<WalletData> {
    // pass phone as query param
    return this.request<WalletData>(`/api/wallet/balance?phone_number=${encodeURIComponent(phone_number)}`);
  }

  async depositFunds(data: DepositRequest): Promise<TransactionResponse> {
    return this.request<TransactionResponse>("/api/wallet/deposit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async withdrawFunds(data: WithdrawRequest): Promise<TransactionResponse> {
    return this.request<TransactionResponse>("/api/wallet/withdraw", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ASSETS
  async getMarketAssets(): Promise<Asset[]> {
    return this.request<Asset[]>("/api/assets/market");
  }

  // INVESTMENTS
  async getMyInvestments(phone_number: string): Promise<UserInvestment[]> {
    return this.request<UserInvestment[]>(`/api/investments/my?phone_number=${encodeURIComponent(phone_number)}`);
  }

  async buyInvestment(data: InvestmentRequest): Promise<any> {
    return this.request("/api/investments/buy", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Legacy CRUD endpoints compatible with your UI
  async createInvestment(data: Investment): Promise<Investment> {
    return this.request<Investment>("/api/investments/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getInvestments(): Promise<Investment[]> {
    return this.request<Investment[]>("/api/investments/");
  }

  async getInvestment(id: number): Promise<Investment> {
    return this.request<Investment>(`/api/investments/${id}`);
  }

  async updateInvestment(id: number, data: Partial<Investment>): Promise<Investment> {
    return this.request<Investment>(`/api/investments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteInvestment(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/investments/${id}`, {
      method: "DELETE",
    });
  }

  // ACTIVITIES
  async getMyActivities(phone_number: string): Promise<UserActivity[]> {
    return this.request<UserActivity[]>(`/api/activities/my?phone_number=${encodeURIComponent(phone_number)}`);
  }

  // PnL
  async getCurrentPnL(phone_number: string): Promise<PnLData> {
    return this.request<PnLData>(`/api/pnl/current?phone_number=${encodeURIComponent(phone_number)}`);
  }

  // health
  async healthCheck(): Promise<any> {
    return this.request("/api/health");
  }
}

export const apiService = new ApiService();
export default apiService;

// Named exports for compatibility with existing imports
export const getInvestments = () => apiService.getInvestments();
export const createInvestment = (data: Investment) => apiService.createInvestment(data);
export const deleteInvestment = (id: number) => apiService.deleteInvestment(id);

export const getAssets = () => apiService.getMarketAssets();
export const getPnL = (phone_number: string) => apiService.getCurrentPnL(phone_number);
export const getWalletBalance = (phone_number: string) => apiService.getWalletBalance(phone_number);
export const depositFunds = (data: DepositRequest) => apiService.depositFunds(data);
export const withdrawFunds = (data: WithdrawRequest) => apiService.withdrawFunds(data);

export const login = (data: UserLogin) => apiService.login(data);
export const register = (data: UserCreate) => apiService.register(data);
export const getMyInvestments = (phone_number: string) => apiService.getMyInvestments(phone_number);
export const getMyActivities = (phone_number: string) => apiService.getMyActivities(phone_number);
