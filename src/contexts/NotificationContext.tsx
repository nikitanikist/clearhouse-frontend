import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Demo notifications for testing
const demoNotifications: Notification[] = [
  {
    id: '1',
    title: 'Form Status Update',
    message: 'Your closeout form for ABC Corp has been approved and completed.',
    type: 'success',
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    read: false,
    actionUrl: '/dashboard/closeout-forms/completed',
    actionLabel: 'View Form'
  },
  {
    id: '2',
    title: 'New Assignment',
    message: 'You have been assigned a new closeout form for XYZ Industries.',
    type: 'info',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false,
    actionUrl: '/dashboard/closeout-forms/pending',
    actionLabel: 'Review'
  },
  {
    id: '3',
    title: 'Form Requires Amendment',
    message: 'The closeout form for DEF Company needs amendments. Please review the comments.',
    type: 'warning',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    read: true,
    actionUrl: '/dashboard/closeout-forms/rejected',
    actionLabel: 'Fix Issues'
  },
  {
    id: '4',
    title: 'System Maintenance',
    message: 'Scheduled system maintenance will occur this weekend from 2-4 AM EST.',
    type: 'info',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true
  }
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};