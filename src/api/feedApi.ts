import axiosInstance from './axiosInstance';
import { FeedResponse } from '../types/posts';

export const feedApi = {
  // Get personalized feed for authenticated user
  getFeed: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<FeedResponse> => {
    const response = await axiosInstance.get('/feed/', { params });
    return response.data;
  },
};
