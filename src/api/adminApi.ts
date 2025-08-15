import axiosInstance from './axiosInstance';
import { 
  PaginatedResponse, 
  AdminUser, 
  AdminUserDetail, 
  AdminPost, 
  AdminPostDetail, 
  AdminStats, 
  AdminUserUpdateRequest, 
  AdminUserUpdateResponse, 
  AdminPostDeleteResponse, 
  AdminQueryParams 
} from '../types/admin';

export const adminApi = {
  // User Management
  getUsers: async (params: AdminQueryParams = {}): Promise<PaginatedResponse<AdminUser>> => {
    const response = await axiosInstance.get('/admin/users/', { params });
    return response.data;
  },

  getUserDetails: async (userId: number): Promise<AdminUserDetail> => {
    const response = await axiosInstance.get(`/admin/users/${userId}/`);
    return response.data;
  },

  updateUser: async (userId: number, userData: AdminUserUpdateRequest): Promise<AdminUserUpdateResponse> => {
    const response = await axiosInstance.put(`/admin/users/${userId}/update/`, userData);
    return response.data;
  },

  // Post Management
  getPosts: async (params: AdminQueryParams = {}): Promise<PaginatedResponse<AdminPost>> => {
    const response = await axiosInstance.get('/admin/posts/', { params });
    return response.data;
  },

  getPostDetails: async (postId: number): Promise<AdminPostDetail> => {
    const response = await axiosInstance.get(`/admin/posts/${postId}/`);
    return response.data;
  },

  deletePost: async (postId: number): Promise<AdminPostDeleteResponse> => {
    const response = await axiosInstance.delete(`/admin/posts/${postId}/delete/`);
    return response.data;
  },

  // Statistics
  getStats: async (): Promise<AdminStats> => {
    const response = await axiosInstance.get('/admin/stats/');
    return response.data;
  }
};
