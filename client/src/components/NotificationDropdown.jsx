import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { Check, Heart, Smile, MessageSquare, Link as LinkIcon, Bell } from 'lucide-react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

const ReactionIcon = ({ type }) => {
  switch (type) {
    case 'heart': return <span title="Heart">❤️</span>;
    case 'thumbs_up': return <span title="Thumbs Up">👍</span>;
    case 'laugh': return <span title="Laugh">😂</span>;
    case 'surprised': return <span title="Surprised">😮</span>;
    case 'sad': return <span title="Sad">😢</span>;
    default: return <Heart className="w-4 h-4 text-amber" />;
  }
};

const NotificationItem = ({ notification, onRead, onClose }) => {
  const navigate = useNavigate();
  const { _id, type, actor, post, metadata, isRead, createdAt } = notification;

  const handleClick = () => {
    if (!isRead) {
      onRead(_id);
    }
    onClose();
    
    if ((type === 'post_like' || type === 'post_reaction' || type === 'post_comment') && post) {
      navigate(`/post/${post._id || post}`);
    } else if (type === 'user_link' && actor) {
      navigate(`/user/${actor._id || actor}`);
    }
  };

  const getActorName = () => actor?.name || 'Someone';

  const renderContent = () => {
    switch (type) {
      case 'post_like':
        return (
          <p className="text-sm text-text-primary">
            <span className="font-semibold">{getActorName()}</span> liked your post.
          </p>
        );
      case 'post_reaction':
        return (
          <p className="text-sm text-text-primary">
            <span className="font-semibold">{getActorName()}</span> reacted <ReactionIcon type={metadata?.reactionType} /> to your post.
          </p>
        );
      case 'post_comment':
        return (
          <p className="text-sm text-text-primary">
            <span className="font-semibold">{getActorName()}</span> commented on your post.
          </p>
        );
      case 'user_link':
        return (
          <p className="text-sm text-text-primary">
            <span className="font-semibold">{getActorName()}</span> linked with you.
          </p>
        );
      default:
        return <p className="text-sm text-text-primary">You have a new notification.</p>;
    }
  };

  const renderIcon = () => {
    switch (type) {
      case 'post_like':
        return <Heart className="w-5 h-5 text-red-500 fill-current" />;
      case 'post_reaction':
        return <Smile className="w-5 h-5 text-amber" />;
      case 'post_comment':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'user_link':
        return <LinkIcon className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-text-secondary" />;
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 border-b border-border hover:bg-surface-raised cursor-pointer transition-colors duration-150 flex items-start gap-3 ${!isRead ? 'bg-surface-raised/50' : ''}`}
      role="menuitem"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="shrink-0 mt-1">
        {actor?.profilePicUrl ? (
          <img src={actor.profilePicUrl} alt={getActorName()} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-surface-raised border border-border flex items-center justify-center text-xs font-bold text-amber">
            {getActorName().charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          {renderContent()}
          {!isRead && <div className="w-2 h-2 rounded-full bg-amber shrink-0 mt-1.5" aria-label="Unread" />}
        </div>
        <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary">
          {renderIcon()}
          <span>{timeAgo(createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

const NotificationDropdown = () => {
  const { 
    isOpen, 
    closeDropdown, 
    notifications, 
    loading, 
    hasMore, 
    loadMore, 
    handleMarkAsRead, 
    handleMarkAllAsRead,
    unreadCount
  } = useNotifications();
  const dropdownRef = useRef(null);

  // Close on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        closeDropdown();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeDropdown]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-14 right-0 md:right-4 w-full md:w-96 bg-canvas border border-border md:rounded-xl shadow-xl z-50 flex flex-col overflow-hidden max-h-[80vh] md:max-h-150 animate-fade-in"
      role="menu"
      aria-label="Notifications"
    >
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface shrink-0">
        <h3 className="font-bold text-text-primary text-lg">Notifications</h3>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="text-xs font-medium text-amber hover:text-amber-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded px-2 py-1 transition-colors"
          >
            <Check className="w-3 h-3 inline mr-1" />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {notifications.length === 0 && !loading && (
          <div className="py-8">
            <EmptyState 
              title="All caught up!"
              message="You don't have any notifications right now."
              icon={Bell}
            />
          </div>
        )}

        {notifications.map(notification => (
          <NotificationItem 
            key={notification._id} 
            notification={notification} 
            onRead={handleMarkAsRead}
            onClose={closeDropdown}
          />
        ))}

        {loading && (
          <div className="p-4">
            <Skeleton variant="post" count={1} />
          </div>
        )}

        {hasMore && !loading && notifications.length > 0 && (
          <div className="p-3 text-center">
            <button
              type="button"
              onClick={loadMore}
              className="text-sm font-medium text-amber hover:text-amber-hover focus-visible:outline-none focus-visible:underline"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
