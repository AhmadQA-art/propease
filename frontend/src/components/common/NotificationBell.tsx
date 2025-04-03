import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { format, formatDistanceToNow } from 'date-fns';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      refreshNotifications();
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lease':
        return <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500">
          <Clock className="w-4 h-4" />
        </div>;
      case 'payment':
        return <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-500">
          <DollarSign className="w-4 h-4" />
        </div>;
      default:
        return <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
          <Bell className="w-4 h-4" />
        </div>;
    }
  };
  
  // Format the time
  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If less than 7 days ago, show relative time
    if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    // Otherwise show formatted date
    return format(date, 'MMM d, yyyy');
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.related_type === 'lease') {
      // Navigate to leases page with expiring filter
      navigate('/leases?filter=expiring');
    } else if (notification.related_type === 'payment') {
      // Navigate to payments page with overdue filter
      navigate('/payments?filter=overdue');
    }
    
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleNotifications}
        className="h-8 w-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 transition-colors relative shadow-sm"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-4 h-4 text-[#2C3539]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-full mr-2 mt-0 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-100 max-h-[calc(100vh-150px)] overflow-auto">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
            <h3 className="font-medium text-gray-700">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Check className="w-3 h-3 mr-1" />
                Mark all as read
              </button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            <div>
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 border-b border-gray-100 flex items-start gap-3 cursor-pointer hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}
                >
                  {getNotificationIcon(notification.related_type)}
                  <div className="flex-1">
                    <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatNotificationTime(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;