import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  related_id?: string;
  related_type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

// Create the context with default values
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: true,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  refreshNotifications: async () => {},
});

// Custom hook to use the notification context
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Function to fetch notifications from Supabase
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      // Fetch notifications ordered by read status and date
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('is_read', { ascending: true })
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.is_read).length || 0);
      }
    } catch (error) {
      console.error('Unexpected error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
        
      if (error) {
        console.error('Error marking notification as read:', error);
      } else {
        // Update the local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, is_read: true } 
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
        
      if (error) {
        console.error('Error marking all notifications as read:', error);
      } else {
        // Update the local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Function to navigate to the related item
  const navigateToRelatedItem = (relatedType: string, relatedId: string) => {
    if (relatedType === 'lease') {
      // Navigate to lease details or filtered leases page
      window.location.href = `/leases?filter=expiring`;
    } else if (relatedType === 'payment') {
      // Navigate to payment details or filtered payments page
      window.location.href = `/payments?filter=overdue`;
    }
  };

  // Initial fetch and subscription setup
  useEffect(() => {
    fetchNotifications();
    
    // Get current user ID
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      return data?.user?.id;
    };
    
    // Set up real-time notifications using Supabase
    getUserId().then(userId => {
      if (!userId) return;
      
      const notificationSubscription = supabase
        .channel('public:notifications')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, payload => {
          // Add the new notification to the list
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification if supported
          if ("Notification" in window) {
            if (Notification.permission === "granted") {
              new Notification(newNotification.title, {
                body: newNotification.message
              });
            } else if (Notification.permission !== "denied") {
              Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                  new Notification(newNotification.title, {
                    body: newNotification.message
                  });
                }
              });
            }
          }
        })
        .subscribe();
      
      // Refresh notifications every 5 minutes
      const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
      
      return () => {
        notificationSubscription.unsubscribe();
        clearInterval(interval);
      };
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      loading, 
      markAsRead, 
      markAllAsRead, 
      refreshNotifications: fetchNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};