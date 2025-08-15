export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  is_email_verified: boolean;
  date_joined: string;
  last_login: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  privacy_setting: 'public' | 'private' | 'followers_only';
  avatar_url?: string;
}

export interface AdminUserDetail extends AdminUser {
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
  total_likes_received: number;
  total_comments_received: number;
}

export interface AdminPost {
  id: number;
  content: string;
  author_username: string;
  author_email: string;
  author_avatar?: string;
  category?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  like_count: number;
  comment_count: number;
}

export interface AdminPostDetail extends AdminPost {
  author_avatar?: string;
}

export interface AdminStats {
  total_users: number;
  total_posts: number;
  active_users_today: number;
  active_posts_today: number;
  total_likes: number;
  total_comments: number;
  users_created_today: number;
  posts_created_today: number;
}

export interface AdminUserUpdateRequest {
  is_active?: boolean;
  role?: 'user' | 'admin';
}

export interface AdminUserUpdateResponse {
  detail: string;
  user: AdminUserDetail;
}

export interface AdminPostDeleteResponse {
  detail: string;
  post_id: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AdminQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: 'user' | 'admin';
  is_active?: boolean;
  category?: string;
  author_id?: number;
}
