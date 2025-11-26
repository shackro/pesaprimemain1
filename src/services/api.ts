// src/services/api.ts
import axios from "axios";

/* eslint-disable @typescript-eslint/no-explicit-any */
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
  id: number;
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
// API SERVICE CLASS
// ===============================
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL =
      import.meta.env.VITE_API_BASE_URL || "https://pesaprime-end-v3.onrender.com";
    console.log("🚀 API Service initialized with URL:", this.baseURL);
  }

  private getToken(): string | null {
    try {
      return localStorage.getItem("authToken");
    } catch {
      return null;
    }
  }

  private setToken(token: string) {
    localStorage.setItem("authToken", token);
  }

  private removeToken() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
    const token = this.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const text = await response.text();
        let message = `HTTP ${response.status}`;
        try {
          const data = JSON.parse(text);
          message = data.detail || data.message || text;
        } catch {}
        throw new Error(message);
      }
      return response.status === 204 ? ({} as T) : await response.json();
    } catch (error: any) {
      console.error(`API request failed for ${url}`, error);
      throw new Error(error.message || "Unknown error occurred");
    }
  }

  // ===============================
  // AUTH METHODS
  // ===============================
  async register(userData: UserCreate): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    if (data.access_token) this.setToken(data.access_token);
    localStorage.setItem("userData", JSON.stringify(data.user));
    return data;
  }

  async login(loginData: UserLogin): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(loginData),
    });
    if (data.access_token) this.setToken(data.access_token);
    localStorage.setItem("userData", JSON.stringify(data.user));
    return data;
  }

  logout() {
    this.removeToken();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/api/auth/me");
  }

  // ===============================
  // WALLET
  // ===============================
  async getWalletBalance(): Promise<WalletData> {
    return this.request<WalletData>("/api/wallet/balance");
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

  // ===============================
  // ASSETS
  // ===============================
  async getMarketAssets(): Promise<Asset[]> {
    return this.request<Asset[]>("/api/assets/market");
  }

  // ===============================
  // INVESTMENTS
  // ===============================
  async getMyInvestments(): Promise<UserInvestment[]> {
    return this.request<UserInvestment[]>("/api/investments/my");
  }

  async buyInvestment(data: InvestmentRequest): Promise<{
    success: boolean;
    message: string;
    investment: UserInvestment;
    new_balance: number;
  }> {
    return this.request("/api/investments/buy", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createInvestment(data: Investment): Promise<Investment> {
    return this.request("/api/investments/", {
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

  // ===============================
  // ACTIVITIES
  // ===============================
  async getMyActivities(): Promise<UserActivity[]> {
    return this.request<UserActivity[]>("/api/activities/my");
  }

  // ===============================
  // PnL
  // ===============================
  async getCurrentPnL(): Promise<PnLData> {
    return this.request<PnLData>("/api/pnl/current");
  }

  // ===============================
  // HEALTH CHECKS
  // ===============================
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request("/api/health");
  }

  async serverHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request("/health");
  }

  // ===============================
  // UTILS
  // ===============================
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getStoredUser(): User | null {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  }

  getCurrentUserPhone(): string | null {
    const user = this.getStoredUser();
    return user ? user.phone_number : null;
  }
}

// ===============================
// ERROR HANDLER
// ===============================
export class ApiErrorHandler {
  static handle(error: any, context: string = ""): string {
    console.error(`API Error (${context}):`, error);
    if (error instanceof Error) {
      if (error.message.includes("Network") || error.message.includes("Failed to fetch"))
        return "Cannot connect to server. Check your internet.";
      if (error.message.includes("401")) return "Session expired. Please login again.";
      if (error.message.includes("404")) return "Resource not found.";
      if (error.message.includes("500")) return "Server error. Try again later.";
      return error.message;
    }
    return "An unexpected error occurred.";
  }
}

// ===============================
// EXPORT SINGLETON
// ===============================
export const apiService = new ApiService();
export default apiService;
