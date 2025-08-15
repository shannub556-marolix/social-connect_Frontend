import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Notification } from '../../types/notifications';
import { notificationsApi } from '../../api/notificationsApi';
import { subscribeToNotifications } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';
import Button from '../ui/Button';

interface NotificationDropdownProps {
  className?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { counts, refreshCounts, incrementUnreadCount, decrementUnreadCount, resetUnreadCount } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      refreshCounts();
    }
  }, [isOpen, page]);

  useEffect(() => {
    if (user) {
      // Subscribe to real-time notifications
      const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        incrementUnreadCount();
      });

      return () => unsubscribe();
    }
  }, [user, incrementUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getNotifications(page, 10);
      if (page === 1) {
        setNotifications(response.results);
      } else {
        setNotifications(prev => [...prev, ...response.results]);
      }
      setHasMore(!!response.next);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      decrementUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      resetUnreadCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    // Refresh counts when opening the dropdown
    if (!isOpen) {
      refreshCounts();
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Mobile overlay for better touch handling */}
      {isOpen && (
        <div className="fixed inset-0 z-40 sm:hidden bg-black bg-opacity-25" onClick={() => setIsOpen(false)} />
      )}
      {/* Notification Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
        {counts.unread_count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
            <span className="text-xs">
              {counts.unread_count > 99 ? '99+' : counts.unread_count}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="fixed sm:absolute top-16 right-0 mt-2 w-full sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[calc(100vh-6rem)] sm:max-h-96 overflow-hidden sm:right-0 sm:top-auto sm:mt-2">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {counts.unread_count > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                >
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Mark all read</span>
                  <span className="sm:hidden">All read</span>
                </Button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                <p className="text-sm sm:text-base">No notifications yet</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
                
                {hasMore && (
                  <div className="p-3 sm:p-4 text-center">
                    <Button
                      onClick={loadMore}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
