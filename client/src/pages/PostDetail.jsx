import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Edit3, Trash2, Calendar, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import CommentSection from '../components/CommentSection';
import FounderBadge from '../components/FounderBadge';
import Skeleton from '../components/Skeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageCarousel from '../components/ImageCarousel';
import PollCard from '../components/PollCard';
import PostActions from '../components/PostActions';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [pollData, setPollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        setPost(response.data);
        setPollData(response.data.poll);
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
  const canDelete = isOwner || user?.role === 'founder';

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
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 animate-fade-in">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-all duration-150 mb-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber rounded">
        <ArrowLeft className="h-4 w-4" />
        Feed
      </Link>

      {/* Image Carousel */}
      {imagesList.length > 0 && (
        <div className="mb-6">
          <ImageCarousel images={imagesList} />
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
        <div className="flex items-center justify-between gap-3 flex-wrap">
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
                {author.role === 'founder' && <FounderBadge size="xs" />}
              </div>
              <span className="text-xs text-text-tertiary flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-text-tertiary font-mono bg-surface border border-border/60 px-3 py-1.5 rounded-xl">
            <Eye className="h-3.5 w-3.5" />
            <span>{post.views || 0} views</span>
          </div>
        </div>

        {/* Optional Poll Widget */}
        {(post.postType === 'poll' || pollData) && (
          <div className="my-4">
            <PollCard
              postId={post._id}
              poll={pollData}
              onVoteUpdate={setPollData}
            />
          </div>
        )}

        {/* Body text (HTML Sanitized) */}
        {post.content && (
          <div
            className="text-sm text-text-secondary leading-relaxed prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {/* Reusable PostActions Bar */}
        <div className="py-2 border-y border-border">
          <PostActions
            post={post}
            onPostUpdate={setPost}
            onCommentClick={() => {
              const el = document.getElementById('comments-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

        {/* Comments */}
        <div id="comments-section">
          <CommentSection
            postId={post._id}
            postOwnerId={author._id}
            comments={post.comments || []}
            onCommentsUpdate={handleCommentsUpdate}
          />
        </div>
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
