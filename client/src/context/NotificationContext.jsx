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

  // SSE Connection, Fetch unread count, and Reconnect logic
  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();
    let reconnectTimeout = null;
    let reconnectAttempts = 0;

    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      setPage(1);
      setHasMore(true);
      setIsOpen(false);
      return;
    }

    const connectSSE = async () => {
      if (!isMounted) return;

      try {
        const token = localStorage.getItem('auth_token');
        let rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        if (rawBaseUrl.endsWith('/')) rawBaseUrl = rawBaseUrl.slice(0, -1);
        if (!rawBaseUrl.endsWith('/api')) rawBaseUrl = `${rawBaseUrl}/api`;

        const response = await fetch(`${rawBaseUrl}/notifications/stream`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: abortController.signal
        });

        if (!response.ok) {
          throw new Error(`SSE error: ${response.status}`);
        }

        // Reset backoff on successful connection
        reconnectAttempts = 0; 
        
        // Synchronize state on connect/reconnect to catch missed notifications
        fetchUnreadCount();
        if (isOpen) {
          fetchNotifications(1);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop(); // Keep incomplete chunks

          for (const part of parts) {
            if (part.startsWith('data: ')) {
              const dataStr = part.slice(6);
              try {
                const payload = JSON.parse(dataStr);
                if (payload.type === 'notification:new') {
                  const newNotif = payload.notification;
                  
                  // Deduplicate and insert
                  setNotifications(prev => {
                    if (prev.some(n => n._id === newNotif._id)) return prev;
                    return [newNotif, ...prev];
                  });
                  setUnreadCount(prev => prev + 1);
                }
              } catch (e) {
                console.error('Failed to parse SSE payload', e);
              }
            }
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('SSE connection dropped:', error);
      }

      // Reconnect with backoff
      if (isMounted) {
        const backoff = Math.min(1000 * (2 ** reconnectAttempts), 30000);
        reconnectAttempts++;
        reconnectTimeout = setTimeout(connectSSE, backoff);
      }
    };

    connectSSE();

    return () => {
      isMounted = false;
      abortController.abort();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
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
        
        setPage(data.page || pageNum);
        setHasMore(data.page < (data.totalPages || 1));
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
