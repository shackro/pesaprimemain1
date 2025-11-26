// src/services/api/types.js
// Type definitions for API responses

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
  message?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserCreate {
  email: string;
  password: string;
  name: string;
  phone_number: string;
}

export interface WalletData {
  id: number;
  user_id: number;
  balance: number;
  equity: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: 'crypto' | 'forex' | 'stock';
  current_price: number;
  change_percentage: number;
  moving_average: number;
  trend: 'up' | 'down';
  chart_url: string;
  hourly_income: number;
  min_investment: number;
  duration: number;
}

export interface UserInvestment {
  id: number;
  user_id: number;
  asset_id: string;
  asset_name: string;
  invested_amount: number;
  current_value: number;
  units: number;
  entry_price: number;
  current_price: number;
  profit_loss: number;
  profit_loss_percentage: number;
  status: 'active' | 'closed' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: string;
  user_phone: string;
  activity_type: 'deposit' | 'withdraw' | 'investment' | 'bonus' | 'trade';
  amount: number;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface DepositRequest {
  amount: number;
  phone_number: string;
}

export interface WithdrawRequest {
  amount: number;
  phone_number: string;
}

export interface InvestmentRequest {
  asset_id: string;
  amount: number;
  phone_number: string;
}

export interface PnLData {
  profit_loss: number;
  percentage: number;
  trend: 'up' | 'down';
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}