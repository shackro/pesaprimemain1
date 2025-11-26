// frontend/src/services/api.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

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
  session_id: string;
}

export interface WalletData {
  balance: number;
  equity: number;
  currency: string;
}

export interface DepositRequest {
  amount: number;
  phone_number: string;
  session_id: string;
}

export interface WithdrawRequest {
  amount: number;
  phone_number: string;
  session_id: string;
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
  session_id: string;
}

export interface Investment {
  id?: number;
  user_id: string;
  title: string;
  amount: number;
  category?: string;
}

// Session management
class SessionManager {
  private sessionKey = 'pesaprime_session';
  
  getSession(): string | null {
    return localStorage.getItem(this.sessionKey);
  }
  
  setSession(sessionId: string): void {
    localStorage.setItem(this.sessionKey, sessionId);
  }
  
  clearSession(): void {
    localStorage.removeItem(this.sessionKey);
  }
  
  hasSession(): boolean {
    return !!this.getSession();
  }
}

// ===============================
// ApiService class (session-based)
class ApiService {
  private baseURL: string;
  private sessionManager: SessionManager;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || "https://pesaprime-end-v3.onrender.com";
    this.sessionManager = new SessionManager();
    console.log("🚀 API Service initialized with URL:", this.baseURL);
  }

  private getUrl(path: string) {
    return `${this.baseURL}${path.startsWith("/") ? path : "/" + path}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, requireAuth: boolean = false): Promise<T> {
    const url = this.getUrl(endpoint);
    
    // Add session ID to query parameters for GET requests or body for others
    let finalUrl = url;
    let finalBody = options.body;
    const sessionId = this.sessionManager.getSession();
    
    if (requireAuth && !sessionId) {
      throw new Error("Authentication required - no session found");
    }

    // For GET requests, add session_id as query parameter
    if (sessionId && (!options.method || options.method === 'GET')) {
      const separator = url.includes('?') ? '&' : '?';
      finalUrl = `${url}${separator}session_id=${encodeURIComponent(sessionId)}`;
    }
    
    // For non-GET requests, add session_id to body if it's JSON
    if (sessionId && options.method && options.method !== 'GET' && options.body) {
      try {
        const bodyObj = JSON.parse(options.body as string);
        finalBody = JSON.stringify({ ...bodyObj, session_id: sessionId });
      } catch {
        // If body is not JSON, keep original body
        finalBody = options.body;
      }
    }

    try {
      const res = await fetch(finalUrl, { 
        ...options, 
        body: finalBody,
        headers: { 
          "Content-Type": "application/json", 
          ...(options.headers || {}) 
        } 
      });
      
      if (!res.ok) {
        const txt = await res.text();
        let msg = `HTTP ${res.status}`;
        try {
          const j = JSON.parse(txt);
          msg = j.detail || j.message || txt;
        } catch {}
        
        // Clear session on auth errors
        if (res.status === 401) {
          this.sessionManager.clearSession();
        }
        
        throw new Error(msg);
      }
      
      if (res.status === 204) return {} as T;
      return (await res.json()) as T;
    } catch (err: any) {
      console.error("API request failed:", endpoint, err);
      throw err;
    }
  }

  // AUTH (session-based)
  async register(userData: UserCreate): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.session_id) {
      this.sessionManager.setSession(response.session_id);
    }
    
    return response;
  }

  async login(loginData: UserLogin): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(loginData),
    });
    
    if (response.success && response.session_id) {
      this.sessionManager.setSession(response.session_id);
    }
    
    return response;
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    const sessionId = this.sessionManager.getSession();
    if (sessionId) {
      try {
        await this.request("/api/auth/logout", {
          method: "POST",
          body: JSON.stringify({ session_id: sessionId }),
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    
    this.sessionManager.clearSession();
    return { success: true, message: "Logged out successfully" };
  }

  async getCurrentUser(): Promise<User> {
    const sessionId = this.sessionManager.getSession();
    if (!sessionId) {
      throw new Error("No active session");
    }
    
    return this.request<User>(`/api/auth/me?session_id=${encodeURIComponent(sessionId)}`, {}, true);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.sessionManager.hasSession();
  }

  // WALLET
  async getWalletBalance(phone_number: string): Promise<WalletData> {
    return this.request<WalletData>(`/api/wallet/balance/${encodeURIComponent(phone_number)}`, {}, true);
  }

  async depositFunds(data: DepositRequest): Promise<TransactionResponse> {
    return this.request<TransactionResponse>("/api/wallet/deposit", {
      method: "POST",
      body: JSON.stringify(data),
    }, true);
  }

  async withdrawFunds(data: WithdrawRequest): Promise<TransactionResponse> {
    return this.request<TransactionResponse>("/api/wallet/withdraw", {
      method: "POST",
      body: JSON.stringify(data),
    }, true);
  }

  // ASSETS (public)
  async getMarketAssets(): Promise<Asset[]> {
    return this.request<Asset[]>("/api/assets/market");
  }

  // INVESTMENTS
  async getMyInvestments(phone_number: string): Promise<UserInvestment[]> {
    return this.request<UserInvestment[]>(`/api/investments/my/${encodeURIComponent(phone_number)}`, {}, true);
  }

  async buyInvestment(data: InvestmentRequest): Promise<any> {
    return this.request("/api/investments/buy", {
      method: "POST",
      body: JSON.stringify(data),
    }, true);
  }

  // ACTIVITIES
  async getMyActivities(phone_number: string): Promise<UserActivity[]> {
    return this.request<UserActivity[]>(`/api/activities/my/${encodeURIComponent(phone_number)}`, {}, true);
  }

  // PnL
  async getCurrentPnL(phone_number: string): Promise<PnLData> {
    return this.request<PnLData>(`/api/wallet/pnl?phone_number=${encodeURIComponent(phone_number)}`, {}, true);
  }

  // health (public)
  async healthCheck(): Promise<any> {
    return this.request("/api/health");
  }

  // Legacy CRUD endpoints for compatibility
  async createInvestment(data: Investment): Promise<Investment> {
    return this.request<Investment>("/api/investments/", {
      method: "POST",
      body: JSON.stringify(data),
    }, true);
  }

  async getInvestments(): Promise<Investment[]> {
    return this.request<Investment[]>("/api/investments/", {}, true);
  }

  async getInvestment(id: number): Promise<Investment> {
    return this.request<Investment>(`/api/investments/${id}`, {}, true);
  }

  async updateInvestment(id: number, data: Partial<Investment>): Promise<Investment> {
    return this.request<Investment>(`/api/investments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, true);
  }

  async deleteInvestment(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/investments/${id}`, {
      method: "DELETE",
    }, true);
  }
}

export const apiService = new ApiService();

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
export const logout = () => apiService.logout();
export const getCurrentUser = () => apiService.getCurrentUser();
export const isAuthenticated = () => apiService.isAuthenticated();
export const getMyInvestments = (phone_number: string) => apiService.getMyInvestments(phone_number);
export const getMyActivities = (phone_number: string) => apiService.getMyActivities(phone_number);
