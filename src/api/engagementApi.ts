import axiosInstance from './axiosInstance';
import {
  Like,
  Comment,
  LikeStatus,
  CommentsResponse,
  CreateCommentRequest,
} from '../types/engagement';

export const engagementApi = {
  // Like a post
  likePost: async (postId: number): Promise<Like> => {
    const response = await axiosInstance.post(`/engagement/posts/${postId}/like/`);
    return response.data;
  },

  // Unlike a post
  unlikePost: async (postId: number): Promise<void> => {
    await axiosInstance.delete(`/engagement/posts/${postId}/unlike/`);
  },

  // Check like status
  getLikeStatus: async (postId: number): Promise<LikeStatus> => {
    const response = await axiosInstance.get(`/engagement/posts/${postId}/like-status/`);
    return response.data;
  },

  // Get comments for a post
  getComments: async (postId: number, params?: {
    page?: number;
    page_size?: number;
  }): Promise<CommentsResponse> => {
    const response = await axiosInstance.get(`/engagement/posts/${postId}/comments/`, { params });
    return response.data;
  },

  // Add a comment to a post
  createComment: async (postId: number, data: CreateCommentRequest): Promise<Comment> => {
    const response = await axiosInstance.post(`/engagement/posts/${postId}/comments/create/`, data);
    return response.data;
  },

  // Delete a comment
  deleteComment: async (postId: number, commentId: number): Promise<void> => {
    await axiosInstance.delete(`/engagement/posts/${postId}/comments/${commentId}/`);
  },
};
