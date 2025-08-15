import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationCounts } from '../types/notifications';
import { notificationsApi } from '../api/notificationsApi';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  counts: NotificationCounts;
  refreshCounts: () => Promise<void>;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [counts, setCounts] = useState<NotificationCounts>({ unread_count: 0, total_count: 0 });
  const { user } = useAuth();

  const refreshCounts = async () => {
    if (!user) return;
    
    try {
      const response = await notificationsApi.getCounts();
      setCounts(response);
    } catch (error) {
      console.error('Error refreshing notification counts:', error);
    }
  };

  const incrementUnreadCount = () => {
    setCounts(prev => ({
      ...prev,
      unread_count: prev.unread_count + 1,
      total_count: prev.total_count + 1
    }));
  };

  const decrementUnreadCount = () => {
    setCounts(prev => ({
      ...prev,
      unread_count: Math.max(0, prev.unread_count - 1)
    }));
  };

  const resetUnreadCount = () => {
    setCounts(prev => ({
      ...prev,
      unread_count: 0
    }));
  };

  // Load initial counts when user changes
  useEffect(() => {
    if (user) {
      refreshCounts();
    } else {
      setCounts({ unread_count: 0, total_count: 0 });
    }
  }, [user]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshCounts();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const value: NotificationContextType = {
    counts,
    refreshCounts,
    incrementUnreadCount,
    decrementUnreadCount,
    resetUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
