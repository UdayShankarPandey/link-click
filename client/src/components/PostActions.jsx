import React, { useState } from 'react';
import { MessageSquare, Bookmark, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const REACTION_EMOJIS = [
  { type: 'heart', emoji: '❤️', label: 'Heart' },
  { type: 'thumbs_up', emoji: '👍', label: 'Thumbs Up' },
  { type: 'laugh', emoji: '😂', label: 'Laugh' },
  { type: 'surprised', emoji: '😮', label: 'Surprised' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
];

const PostActions = ({ post, onPostUpdate, onCommentClick, showLabels = false }) => {
  const { user, setUser } = useAuth();
  const [showPicker, setShowPicker] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  const currentUserId = user?._id?.toString() || user?.id?.toString();

  // Find user's active reaction
  const userReactionObj = user && post.reactions?.find(
    (r) => (r.user?._id ? r.user._id.toString() : r.user?.toString()) === currentUserId
  );
  const activeReactionType = userReactionObj?.type || (post.likes?.some(
    (l) => (l._id ? l._id.toString() : l.toString()) === currentUserId
  ) ? 'heart' : null);

  // Grouped reaction counts
  const reactionCounts = {
    heart: 0,
    thumbs_up: 0,
    laugh: 0,
    surprised: 0,
    sad: 0
  };

  if (post.reactions && post.reactions.length > 0) {
    post.reactions.forEach(r => {
      if (reactionCounts[r.type] !== undefined) reactionCounts[r.type]++;
    });
  } else if (post.likes && post.likes.length > 0) {
    reactionCounts.heart = post.likes.length;
  }

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

  // Bookmark state
  const isBookmarked = user?.bookmarks?.some(
    (bId) => (bId._id ? bId._id.toString() : bId.toString()) === post._id.toString()
  );

  // Handle reaction selection
  const handleReactionSelect = async (type) => {
    if (!user) {
      toast.error('Please sign in to react to posts');
      return;
    }
    if (isReacting) return;
    
    setIsReacting(true);
    setShowPicker(false);

    try {
      const response = await api.post(`/posts/${post._id}/react`, { type });
      if (onPostUpdate) {
        onPostUpdate({
          ...post,
          reactions: response.data.reactions,
          likes: response.data.likes
        });
      }
    } catch {
      toast.error('Failed to update reaction');
    } finally {
      setIsReacting(false);
    }
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    if (!user) {
      toast.error('Please sign in to bookmark posts');
      return;
    }
    if (isBookmarking) return;

    setIsBookmarking(true);
    try {
      const response = await api.post(`/posts/${post._id}/bookmark`);
      const newBookmarked = response.data.isBookmarked;
      toast.success(newBookmarked ? '✓ Post saved to bookmarks' : '✓ Bookmark removed');

      // Update user bookmarks in context immutably
      if (user && setUser) {
        if (newBookmarked) {
          if (!user.bookmarks?.includes(post._id)) {
            setUser({ ...user, bookmarks: [...(user.bookmarks || []), post._id] });
          }
        } else {
          setUser({ ...user, bookmarks: (user.bookmarks || []).filter(b => b.toString() !== post._id.toString()) });
        }
      }

      if (onPostUpdate) {
        onPostUpdate({ ...post, _bookmarkUpdated: Date.now() });
      }
    } catch {
      toast.error('Failed to update bookmark');
    } finally {
      setIsBookmarking(false);
    }
  };

  // Native share or clipboard fallback
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post._id}`;
    const shareData = {
      title: post.title,
      text: `Check out this post on Link Click: ${post.title}`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          await navigator.clipboard.writeText(shareUrl);
          toast.success('✓ Link copied');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('✓ Link copied');
      } catch {
        toast.error('Failed to copy link');
      }
    }
  };

  return (
    <div className="flex items-center justify-between gap-1 sm:gap-2 py-2 border-t border-border/40 min-w-0">
      {/* Reaction Picker Button & Popover */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setShowPicker((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber ${
            activeReactionType
              ? 'bg-amber/10 text-amber border border-amber/30'
              : 'text-text-tertiary hover:text-text-primary hover:bg-surface-raised'
          }`}
          aria-label="React to post"
          title="React to post"
        >
          <span>{activeReactionType ? REACTION_EMOJIS.find(r => r.type === activeReactionType)?.emoji || '❤️' : '❤️'}</span>
          <span>{totalReactions > 0 ? totalReactions : 'React'}</span>
        </button>

        {/* Reaction Popover */}
        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 p-1.5 bg-surface border border-border rounded-2xl shadow-xl flex items-center gap-1 z-30 animate-fade-in">
            {REACTION_EMOJIS.map((r) => (
              <button
                key={r.type}
                type="button"
                onClick={() => handleReactionSelect(r.type)}
                className={`p-2 rounded-xl text-lg hover:scale-125 transition-transform duration-150 cursor-pointer ${
                  activeReactionType === r.type ? 'bg-amber/20' : 'hover:bg-surface-raised'
                }`}
                title={r.label}
                aria-label={r.label}
              >
                {r.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comment Button */}
      <button
        type="button"
        onClick={onCommentClick}
        title="View comments"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-text-tertiary hover:text-amber hover:bg-surface-raised transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber shrink-0"
      >
        <MessageSquare className="h-4 w-4 shrink-0" />
        <span>{post.comments?.length || 0}</span>
      </button>

      {/* Bookmark Button */}
      <button
        type="button"
        onClick={handleBookmarkToggle}
        disabled={isBookmarking}
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber shrink-0 ${
          isBookmarked
            ? 'text-amber bg-amber/10 border border-amber/30'
            : 'text-text-tertiary hover:text-amber hover:bg-surface-raised'
        }`}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
      >
        <Bookmark className={`h-4 w-4 shrink-0 ${isBookmarked ? 'fill-amber' : ''}`} />
        {showLabels && <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>}
      </button>

      {/* Share Button */}
      <button
        type="button"
        onClick={handleShare}
        title="Share post"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-text-tertiary hover:text-amber hover:bg-surface-raised transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber shrink-0"
        aria-label="Share post"
      >
        <Share2 className="h-4 w-4 shrink-0" />
        {showLabels && <span className="hidden sm:inline">Share</span>}
      </button>
    </div>
  );
};

export default PostActions;
