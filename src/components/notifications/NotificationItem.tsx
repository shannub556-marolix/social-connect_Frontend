import React from 'react';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Notification } from '../../types/notifications';
import Avatar from '../ui/Avatar';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const getNotificationIcon = () => {
    switch (notification.notification_type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div 
      className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.is_read ? 'bg-blue-50' : ''
      }`}
      onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start space-x-2 sm:space-x-3">
        <div className="flex-shrink-0">
          <Avatar 
            src={notification.sender_avatar} 
            alt={notification.sender_username}
            size="sm"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {getNotificationIcon()}
            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
              {notification.title}
            </p>
            {!notification.is_read && (
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            )}
          </div>
          
          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <p className="text-xs text-gray-400 mt-1 sm:mt-2">
            {formatTime(notification.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
