import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Heart, ArrowLeft, Edit3, Trash2, Shield, Calendar, X } from 'lucide-react';
import toast from 'react-hot-toast';
import CommentSection from '../components/CommentSection';
import Skeleton from '../components/Skeleton';
import ConfirmDialog from '../components/ConfirmDialog';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error('Failed to load post');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Log in to like posts');
      return;
    }
    try {
      setLikeAnimating(true);
      const response = await api.post(`/posts/${id}/like`);
      setPost((prev) => ({ ...prev, likes: response.data.likes }));
      setTimeout(() => setLikeAnimating(false), 300);
    } catch {
      toast.error('Failed to toggle like');
      setLikeAnimating(false);
    }
  };

  const handleDoubleTap = () => {
    const userId = user?.id || user?._id;
    const isLiked = user && post.likes?.some(
      (likeId) => likeId === userId || likeId?._id === userId
    );
    if (!isLiked) {
      handleLike();
    }
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 800);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${id}`);
      toast.success('Post deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setShowDelete(false);
    }
  };

  const handleCommentsUpdate = (newComments) => {
    setPost((prev) => ({ ...prev, comments: newComments }));
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <Skeleton variant="detail" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <h2 className="text-xl font-bold text-text-primary mb-2">Post not found</h2>
        <p className="text-sm text-text-secondary mb-6">It may have been deleted or the link is incorrect.</p>
        <Link to="/" className="text-amber hover:underline font-medium text-sm">← Back to feed</Link>
      </div>
    );
  }

  const author = post.user || {};
  const userId = user?.id || user?._id;
  const isOwner = userId && author._id === userId;
  const canDelete = isOwner || user?.role === 'admin';
  const isLiked = user && post.likes?.some(
    (likeId) => likeId === userId || likeId?._id === userId
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 animate-fade-in">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-5">
        <ArrowLeft className="h-4 w-4" />
        Feed
      </Link>

      {/* Image */}
      <div 
        role="button"
        tabIndex={0}
        aria-label="View full image in lightbox"
        className="rounded-2xl overflow-hidden bg-canvas border border-border mb-6 relative cursor-zoom-in group select-none focus:outline-none focus:ring-2 focus:ring-amber/40"
        onClick={() => setIsLightboxOpen(true)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          handleDoubleTap();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsLightboxOpen(true);
          }
        }}
      >
        <img
          src={post.imageUrl}
          alt={post.title}
          className={`w-full max-h-125 object-contain mx-auto transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0 scale-95'}`}
          onLoad={() => setImageLoaded(true)}
        />
        {showHeartOverlay && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none animate-overlay-in">
            <Heart className="h-24 w-24 fill-white text-white drop-shadow-2xl animate-like-pop" />
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          role="button"
          tabIndex={0}
          aria-label="Close lightbox overlay"
          className="fixed inset-0 z-100 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-overlay-in cursor-zoom-out focus:outline-none"
          onClick={() => setIsLightboxOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsLightboxOpen(false);
            }
          }}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-surface-overlay/50 text-white hover:bg-surface-overlay transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={post.imageUrl}
            alt={post.title}
            className="max-w-full max-h-full object-contain animate-fade-in-scale select-none drop-shadow-2xl"
          />
        </div>
      )}

      {/* Content */}
      <div className="space-y-5">
        {/* Title + Actions */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary leading-snug flex-1">
            {post.title}
          </h1>
          {(isOwner || canDelete) && (
            <div className="flex items-center gap-2 shrink-0">
              {isOwner && (
                <Link
                  to={`/post/${post._id}/edit`}
                  className="p-2 rounded-lg text-text-tertiary hover:text-amber hover:bg-amber-muted border border-border transition-colors"
                  title="Edit post"
                >
                  <Edit3 className="h-4 w-4" />
                </Link>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => setShowDelete(true)}
                  className="p-2 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-muted border border-border transition-colors cursor-pointer"
                  title="Delete post"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Author row */}
        <div className="flex items-center gap-3">
          <Link
            to={`/user/${author._id}`}
            className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-amber hover:border-amber/30 transition-colors"
          >
            {author.name ? author.name.charAt(0).toUpperCase() : '?'}
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <Link to={`/user/${author._id}`} className="text-sm font-semibold text-text-primary hover:text-amber transition-colors">
                {author.name || 'Unknown'}
              </Link>
              {author.role === 'admin' && (
                <Shield className="h-3 w-3 text-amber" />
              )}
            </div>
            <span className="text-xs text-text-tertiary flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Body text */}
        {post.content && (
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {/* Like bar */}
        <div className="flex items-center gap-4 py-3 border-y border-border">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${
              isLiked ? 'text-coral' : 'text-text-tertiary hover:text-coral'
            }`}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-coral' : ''} ${likeAnimating ? 'animate-like-pop' : ''}`} />
            <span>{post.likes?.length || 0} {post.likes?.length === 1 ? 'like' : 'likes'}</span>
          </button>
        </div>

        {/* Comments */}
        <CommentSection
          postId={post._id}
          postOwnerId={author._id}
          comments={post.comments || []}
          onCommentsUpdate={handleCommentsUpdate}
        />
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete this post?"
        message="This post and all its comments will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};

export default PostDetail;
