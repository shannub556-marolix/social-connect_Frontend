import axiosInstance from './axiosInstance';
import { 
  NotificationResponse, 
  NotificationCounts, 
  MarkReadResponse, 
  MarkAllReadResponse 
} from '../types/notifications';

export const notificationsApi = {
  // Get paginated list of notifications
  getNotifications: async (page: number = 1, pageSize: number = 20): Promise<NotificationResponse> => {
    const response = await axiosInstance.get('/notifications/', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  // Mark a specific notification as read
  markAsRead: async (notificationId: number): Promise<MarkReadResponse> => {
    const response = await axiosInstance.post(`/notifications/${notificationId}/read/`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<MarkAllReadResponse> => {
    const response = await axiosInstance.post('/notifications/mark-all-read/');
    return response.data;
  },

  // Get notification counts
  getCounts: async (): Promise<NotificationCounts> => {
    const response = await axiosInstance.get('/notifications/count/');
    return response.data;
  }
};
