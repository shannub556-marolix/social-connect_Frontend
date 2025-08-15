import axiosInstance from './axiosInstance';
import {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  PostsResponse,
} from '../types/posts';

export const postsApi = {
  // Create a new post
  createPost: async (data: CreatePostRequest): Promise<Post> => {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.category) {
      formData.append('category', data.category);
    }
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await axiosInstance.post('/posts/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get a specific post by ID
  getPost: async (postId: number): Promise<Post> => {
    const response = await axiosInstance.get(`/posts/${postId}/`);
    return response.data;
  },

  // Update a post
  updatePost: async (postId: number, data: UpdatePostRequest): Promise<Post> => {
    const formData = new FormData();
    if (data.content) {
      formData.append('content', data.content);
    }
    if (data.category) {
      formData.append('category', data.category);
    }
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await axiosInstance.put(`/posts/${postId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a post
  deletePost: async (postId: number): Promise<void> => {
    await axiosInstance.delete(`/posts/${postId}/`);
  },

  // List all posts (public)
  getPosts: async (params?: {
    page?: number;
    page_size?: number;
    category?: string;
    author?: number;
    search?: string;
  }): Promise<PostsResponse> => {
    const response = await axiosInstance.get('/posts/', { params });
    return response.data;
  },

  // Get current user's posts
  getMyPosts: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PostsResponse> => {
    const response = await axiosInstance.get('/posts/my/', { params });
    return response.data;
  },
};
