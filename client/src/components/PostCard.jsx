import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import AuthorHovercard from './AuthorHovercard';
import FounderBadge from './FounderBadge';

const PostCard = ({ post, onLikeUpdate }) => {
  const { user } = useAuth();
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const author = post.user || {};
  const isLiked = user && post.likes?.some(
    (likeId) => likeId === (user.id || user._id) || likeId?._id === (user.id || user._id)
  );

  // Task 1: Client-side Reading Time (Math.ceil(wordCount / 200))
  const wordCount = ((post.title || '') + ' ' + (post.content || '')).trim().split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Task 2: Subtle Edited Indicator (updatedAt > createdAt by > 1 min)
  const isEdited = Boolean(
    post.updatedAt &&
    post.createdAt &&
    new Date(post.updatedAt) - new Date(post.createdAt) > 60000
  );

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Log in to like posts');
      return;
    }

    try {
      setLikeAnimating(true);
      const response = await api.post(`/posts/${post._id}/like`);
      if (onLikeUpdate) {
        onLikeUpdate(post._id, response.data.likes);
      }
      setTimeout(() => setLikeAnimating(false), 300);
    } catch {
      toast.error('Failed to toggle like');
      setLikeAnimating(false);
    }
  };

  const handleDoubleTap = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLiked) {
      handleLike(e);
    }
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 800);
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <article className="bg-surface rounded-2xl overflow-hidden border border-border hover:border-surface-overlay transition-colors duration-200 group">
      <Link to={`/post/${post._id}`} className="block">
        {/* Image */}
        <div 
          className="relative aspect-16/10 bg-canvas overflow-hidden"
          onDoubleClick={handleDoubleTap}
        >
          <img
            src={post.imageUrl}
            alt={post.title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.02] ${imageLoaded ? 'opacity-100' : 'opacity-0 scale-95'}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          {showHeartOverlay && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 pointer-events-none animate-overlay-in">
              <Heart className="h-16 w-16 fill-white text-white drop-shadow-xl animate-like-pop" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Author row */}
          <div className="flex items-center gap-3 mb-3">
            <AuthorHovercard author={author}>
              <Link
                to={author._id ? `/user/${author._id}` : '#'}
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-sm font-bold text-amber shrink-0 hover:border-amber/30 transition-colors block"
              >
                {author.name ? author.name.charAt(0).toUpperCase() : '?'}
              </Link>
            </AuthorHovercard>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <AuthorHovercard author={author}>
                  <Link
                    to={author._id ? `/user/${author._id}` : '#'}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-semibold text-text-primary truncate hover:text-amber transition-colors"
                  >
                    {author.name || 'Unknown'}
                  </Link>
                </AuthorHovercard>

                {author.role === 'founder' && <FounderBadge size="xs" />}
                {author.role === 'admin' && (
                  <Shield className="h-3 w-3 text-amber shrink-0" />
                )}
              </div>

              {/* Metadata: Timestamp • Reading Time • Edited Indicator */}
              <div className="flex items-center gap-1.5 text-xs text-text-tertiary flex-wrap">
                <span>{timeAgo(post.createdAt)}</span>
                <span>•</span>
                <span>{readingTimeMinutes} min read</span>
                {isEdited && (
                  <>
                    <span>•</span>
                    <span className="italic" title="This post was edited">(edited)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-base font-bold text-text-primary leading-snug mb-1 line-clamp-2">
            {post.title}
          </h2>
          {post.content && (
            <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 mb-3">
              {post.content}
            </p>
          )}
        </div>
      </Link>

      {/* Engagement bar */}
      <div className="px-4 sm:px-5 pb-4 flex items-center gap-5">
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/50 rounded-md active:scale-95 ${
            isLiked ? 'text-coral' : 'text-text-tertiary hover:text-coral'
          }`}
          aria-label={isLiked ? 'Unlike this post' : 'Like this post'}
        >
          <Heart
            className={`h-4.5 w-4.5 ${isLiked ? 'fill-coral' : ''} ${likeAnimating ? 'animate-like-pop' : ''}`}
          />
          <span>{post.likes?.length || 0}</span>
        </button>

        <Link
          to={`/post/${post._id}`}
          className="flex items-center gap-1.5 text-sm font-medium text-text-tertiary hover:text-amber transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50 rounded-md active:scale-95"
        >
          <MessageSquare className="h-4.5 w-4.5" />
          <span>{post.comments?.length || 0}</span>
        </Link>
      </div>
    </article>
  );
};

export default PostCard;
