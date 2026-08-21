import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUnreadCount, getNotifications, markAsRead, markAllAsRead } from '../services/notificationApi';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch unread count when user authenticates
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
      setNotifications([]);
      setPage(1);
      setHasMore(true);
      setIsOpen(false);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      if (data && data.success) {
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await getNotifications(pageNum, 10);
      
      if (data && data.success) {
        if (pageNum === 1) {
          setNotifications(data.notifications || []);
        } else {
          setNotifications(prev => [...prev, ...(data.notifications || [])]);
        }
        
        setPage(data.pagination.page);
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(prev => {
      const next = !prev;
      // Fetch initial notifications when opening
      if (next && page === 1 && notifications.length === 0) {
        fetchNotifications(1);
      }
      return next;
    });
  };

  const closeDropdown = () => setIsOpen(false);

  const handleMarkAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      await markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert optimistic update
      fetchUnreadCount();
      fetchNotifications(1); 
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
      fetchUnreadCount();
      fetchNotifications(1);
    }
  };

  const value = {
    unreadCount,
    notifications,
    loading,
    hasMore,
    isOpen,
    toggleDropdown,
    closeDropdown,
    loadMore,
    fetchNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    fetchUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
