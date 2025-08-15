export interface Post {
  id: number;
  content: string;
  author: {
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
  };
  image_url?: string;
  category: 'general' | 'technology' | 'lifestyle' | 'travel' | 'food' | 'sports' | 'entertainment' | 'business' | 'education' | 'other';
  created_at: string;
  updated_at: string;
  is_active: boolean;
  like_count: number;
  comment_count: number;
}

export interface CreatePostRequest {
  content: string;
  category?: string;
  image?: File;
}

export interface UpdatePostRequest {
  content?: string;
  category?: string;
  image?: File;
}

export interface PostsResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Post[];
}

export interface FeedPost {
  id: number;
  content: string;
  image_url?: string;
  category: string;
  created_at: string;
  updated_at: string;
  author_id: number;
  author_username: string;
  author_avatar?: string;
  like_count: number;
  comment_count: number;
  is_liked_by_user: boolean;
}

export interface FeedResponse {
  count: number;
  next?: string;
  previous?: string;
  results: FeedPost[];
}
