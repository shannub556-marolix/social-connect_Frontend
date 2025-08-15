export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
  is_email_verified: boolean;
  privacy_setting: 'public' | 'private' | 'followers_only';
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at?: string;
  updated_at?: string;
  is_following?: boolean;
}

export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password2: string;
  role?: 'user' | 'admin';
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
}

export interface ApiResponse {
  message?: string;
  error?: string;
  detail?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  changePassword: (passwords: ChangePasswordRequest) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (data: PasswordResetConfirmRequest) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}
