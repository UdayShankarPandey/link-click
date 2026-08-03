import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AuthorHovercard from './AuthorHovercard';
import FounderBadge from './FounderBadge';
import ImageCarousel from './ImageCarousel';
import PollCard from './PollCard';
import PostActions from './PostActions';

const PostCard = ({ post: initialPost, onLikeUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(initialPost);
  const [pollData, setPollData] = useState(initialPost.poll);
  const [viewsCount, setViewsCount] = useState(initialPost.views || 0);

  const cardRef = useRef(null);
  const timerRef = useRef(null);

  const author = post.user || {};
  const currentUserId = user?._id?.toString() || user?.id?.toString();

  const wordCount = ((post.title || '') + ' ' + (post.content || '')).trim().split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const isEdited = Boolean(
    post.updatedAt &&
    post.createdAt &&
    new Date(post.updatedAt) - new Date(post.createdAt) > 60000
  );

  // Synchronize state if props update
  useEffect(() => {
    setPost(initialPost);
    setPollData(initialPost.poll);
    setViewsCount(initialPost.views || 0);
  }, [initialPost]);

  const authorId = author?._id?.toString() || author?.id?.toString() || null;

  // View Counter IntersectionObserver (50% visibility for 2.5 seconds)
  useEffect(() => {
    if (!post._id) return;

    if (currentUserId && authorId && currentUserId === authorId) return;

    const storageKey = `viewed_post_${post._id}`;
    if (sessionStorage.getItem(storageKey)) return;

    const handleIntersection = (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        if (!timerRef.current) {
          timerRef.current = setTimeout(async () => {
            try {
              sessionStorage.setItem(storageKey, 'true');
              const res = await api.post(`/posts/${post._id}/view`);
              setViewsCount(res.data.views);
            } catch {
              // Ignore silent view error
            }
          }, 2500);
        }
      } else if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: [0, 0.5, 1.0]
    });

    const currentCard = cardRef.current;
    if (currentCard) {
      observer.observe(currentCard);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (currentCard) observer.unobserve(currentCard);
    };
  }, [post._id, authorId, currentUserId]);

  const handlePostActionUpdate = (updatedPost) => {
    setPost(updatedPost);
    if (onLikeUpdate) {
      onLikeUpdate(updatedPost._id, updatedPost.likes);
    }
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

  const getPostImages = (postData) => {
    if (postData.images && postData.images.length > 0) {
      return postData.images;
    }
    if (postData.imageUrl) {
      return [{ url: postData.imageUrl }];
    }
    return [];
  };

  const imagesList = getPostImages(post);

  return (
    <article
      ref={cardRef}
      className="bg-surface rounded-2xl overflow-hidden border border-border hover:border-surface-overlay transition-colors duration-200 group flex flex-col justify-between"
    >
      <div>
        {/* Author Header */}
        <div className="p-4 sm:p-5 pb-3">
          <div className="flex items-center gap-3">
            <AuthorHovercard author={author}>
              <Link
                to={author._id ? `/user/${author._id}` : '#'}
                className="w-9 h-9 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-sm font-bold text-amber shrink-0 hover:border-amber/30 transition-colors"
              >
                {author.name ? author.name.charAt(0).toUpperCase() : '?'}
              </Link>
            </AuthorHovercard>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <AuthorHovercard author={author}>
                  <Link
                    to={author._id ? `/user/${author._id}` : '#'}
                    className="text-sm font-semibold text-text-primary truncate hover:text-amber transition-colors"
                  >
                    {author.name || 'Unknown'}
                  </Link>
                </AuthorHovercard>

                {author.role === 'founder' && <FounderBadge size="xs" />}
              </div>

              {/* Metadata */}
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
        </div>

        {/* Content Title */}
        <div className="px-4 sm:px-5 pb-3">
          <Link to={`/post/${post._id}`}>
            <h2 className="text-base font-bold text-text-primary leading-snug mb-1 hover:text-amber transition-colors line-clamp-2">
              {post.title}
            </h2>
          </Link>
          {post.content && (
            <div
              className="text-sm text-text-secondary leading-relaxed line-clamp-3 mb-2 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}
        </div>

        {/* Image Carousel */}
        {imagesList.length > 0 && (
          <div className="px-4 sm:px-5 mb-3">
            <ImageCarousel images={imagesList} />
          </div>
        )}

        {/* Optional Poll Widget */}
        {(post.postType === 'poll' || pollData) && (
          <div className="px-4 sm:px-5 mb-3">
            <PollCard
              postId={post._id}
              poll={pollData}
              onVoteUpdate={setPollData}
            />
          </div>
        )}
      </div>

      {/* Reusable PostActions Bar */}
      <div className="px-4 sm:px-5 pb-2">
        <PostActions
          post={post}
          onPostUpdate={handlePostActionUpdate}
          onCommentClick={() => navigate(`/post/${post._id}`)}
        />
        <div className="flex items-center justify-end gap-1 text-xs text-text-tertiary font-mono pt-1">
          <Eye className="h-3.5 w-3.5" />
          <span>{viewsCount}</span>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
