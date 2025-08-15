import axiosInstance from './axiosInstance';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ChangePasswordRequest,

  PasswordResetConfirmRequest,
  ApiResponse,
  User,
} from '../types/auth';

export const authApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login/', credentials);
    return response.data;
  },

  // Register
  register: async (userData: RegisterRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post('/auth/register/', userData);
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse> => {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await axiosInstance.post('/auth/logout/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  // Token refresh
  refreshToken: async (): Promise<{ access: string }> => {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await axiosInstance.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  // Change password
  changePassword: async (passwords: ChangePasswordRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post('/auth/change-password/', passwords);
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<ApiResponse> => {
    const response = await axiosInstance.post('/auth/password-reset/', { email });
    return response.data;
  },

  // Confirm password reset
  resetPassword: async (data: PasswordResetConfirmRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post('/auth/password-reset/confirm/', data);
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const response = await axiosInstance.get(`/auth/verify-email/?token=${token}`);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get('/auth/me/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put('/auth/me/', userData);
    return response.data;
  },

  // Get user profile by ID
  getUserProfile: async (userId: number): Promise<User> => {
    const response = await axiosInstance.get(`/auth/${userId}/`);
    return response.data;
  },

  // Follow user
  followUser: async (userId: number): Promise<{ detail: string }> => {
    const response = await axiosInstance.post(`/auth/${userId}/follow/`);
    return response.data;
  },

  // Unfollow user
  unfollowUser: async (userId: number): Promise<void> => {
    await axiosInstance.delete(`/auth/${userId}/follow/`);
  },

  // Get user's followers
  getFollowers: async (userId: number): Promise<any[]> => {
    const response = await axiosInstance.get(`/auth/${userId}/followers/`);
    return response.data;
  },

  // Get user's following
  getFollowing: async (userId: number): Promise<any[]> => {
    const response = await axiosInstance.get(`/auth/${userId}/following/`);
    return response.data;
  },

  // Discover users to follow
  discoverUsers: async (): Promise<User[]> => {
    const response = await axiosInstance.get('/auth/discover/');
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ detail: string; avatar_url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await axiosInstance.post('/auth/me/avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
