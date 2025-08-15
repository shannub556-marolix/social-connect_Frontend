export interface Notification {
  id: number;
  notification_type: 'follow' | 'like' | 'comment';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_username: string;
  sender_avatar?: string;
  notification_data: {
    id: number;
    type: 'follow' | 'like' | 'comment';
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    sender: {
      id: number;
      username: string;
      avatar_url?: string;
    };
    post?: {
      id: number;
      content: string;
    };
    comment?: {
      id: number;
      content: string;
    };
  };
}

export interface NotificationCounts {
  unread_count: number;
  total_count: number;
}

export interface NotificationResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export interface MarkReadResponse {
  detail: string;
  notification_id: number;
}

export interface MarkAllReadResponse {
  detail: string;
  marked_count: number;
}
