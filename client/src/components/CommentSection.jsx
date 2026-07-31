import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';

const CommentSection = ({ postId, postOwnerId, comments = [], onCommentsUpdate }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleAddComment = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const response = await api.post(`/posts/${postId}/comments`, { text: trimmed });
      if (onCommentsUpdate && response.data.post) {
        onCommentsUpdate(response.data.post.comments);
      }
      setText('');
      toast.success('Comment added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteTarget) return;
    try {
      const response = await api.delete(`/posts/${postId}/comments/${deleteTarget}`);
      if (onCommentsUpdate) {
        onCommentsUpdate(response.data.comments);
      }
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setDeleteTarget(null);
    }
  };

  const canDeleteComment = (comment) => {
    if (!user) return false;
    const userId = user.id || user._id;
    const commentUserId = comment.user?._id || comment.user;
    return (
      commentUserId === userId ||
      postOwnerId === userId ||
      user.role === 'admin'
    );
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <section className="space-y-4" aria-label="Comments">
      {/* Add comment form */}
      {user ? (
        <form onSubmit={handleAddComment} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-xs font-bold text-amber shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40 focus:ring-2 focus:ring-amber/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Write a comment…"
            maxLength={2000}
            required
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="p-2.5 rounded-xl bg-amber text-text-inverse hover:bg-amber-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Send comment"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <p className="text-sm text-text-tertiary text-center py-2">
          <Link to="/login" className="text-amber hover:underline font-medium">Log in</Link> to join the conversation.
        </p>
      )}

      {/* Comments list */}
      <div className="space-y-2 max-h-100 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-4">No comments yet. Be the first to share your thoughts.</p>
        ) : (
          comments.map((comment) => {
            const author = comment.user || {};
            return (
              <div key={comment._id} className="flex items-start gap-3 p-3 rounded-xl bg-canvas/50 border border-border-subtle animate-fade-in group/comment">
                <Link
                  to={author._id ? `/user/${author._id}` : '#'}
                  className="w-7 h-7 rounded-md bg-surface-raised border border-border flex items-center justify-center text-xs font-bold text-text-secondary shrink-0 hover:text-amber hover:border-amber/30 transition-colors"
                >
                  {author.name ? author.name.charAt(0).toUpperCase() : '?'}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      to={author._id ? `/user/${author._id}` : '#'}
                      className="text-xs font-semibold text-text-primary hover:text-amber transition-colors truncate"
                    >
                      {author.name || 'Anonymous'}
                    </Link>
                    <span className="text-[11px] text-text-tertiary shrink-0">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-0.5 leading-relaxed wrap-break-word whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
                {canDeleteComment(comment) && (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(comment._id)}
                    className="p-1 rounded-md text-text-tertiary hover:text-danger sm:opacity-0 sm:group-hover/comment:opacity-100 opacity-100 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger active:scale-95"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete comment"
        message="This comment will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDeleteComment}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
};

export default CommentSection;
