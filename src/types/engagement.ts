export interface Like {
  id: number;
  user: {
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
  post: number;
  created_at: string;
}

export interface Comment {
  id: number;
  user: {
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
  post: number;
  content: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface LikeStatus {
  is_liked: boolean;
  like_count: number;
}

export interface CommentsResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Comment[];
}

export interface CreateCommentRequest {
  content: string;
}
