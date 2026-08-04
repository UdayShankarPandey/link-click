import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Trash2, Edit2, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';
import FounderBadge from './FounderBadge';

const CommentItem = ({
  comment,
  postId,
  postOwnerId,
  user,
  onCommentsUpdate,
  setDeleteTarget,
  onReplyClick
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text || '');
  const [savingEdit, setSavingEdit] = useState(false);

  const userId = user?.id || user?._id;
  const commentUserId = comment.user?._id || comment.user;
  const author = comment.user || {};

  const isOwner = userId && commentUserId === userId;
  const canDelete = isOwner || postOwnerId === userId || user?.role === 'founder';

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

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    setSavingEdit(true);
    try {
      const response = await api.put(`/posts/${postId}/comments/${comment._id}`, { text: editText.trim() });
      if (onCommentsUpdate) {
        onCommentsUpdate(response.data.comments);
      }
      setIsEditing(false);
      toast.success('Comment updated');
    } catch {
      toast.error('Failed to update comment');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-canvas/50 border border-border-subtle group/comment">
      <Link
        to={author._id ? `/user/${author._id}` : '#'}
        className="w-7 h-7 rounded-md bg-surface-raised border border-border flex items-center justify-center text-xs font-bold text-text-secondary shrink-0 hover:text-amber transition-colors"
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
          {author.role === 'founder' && <FounderBadge size="xs" />}
          <span className="text-[11px] text-text-tertiary shrink-0">{timeAgo(comment.createdAt)}</span>
          {comment.isEdited && (
            <span className="text-[10px] text-text-tertiary italic">(edited)</span>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 text-xs bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-amber"
              rows={2}
              maxLength={2000}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit || !editText.trim()}
                className="px-2.5 py-1 rounded-md bg-amber text-text-inverse text-xs font-semibold hover:bg-amber-hover transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditText(comment.text);
                }}
                className="px-2.5 py-1 rounded-md bg-surface border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5 leading-relaxed wrap-break-word whitespace-pre-wrap">
            {comment.text}
          </p>
        )}

        {/* Action controls (Reply, Edit, Delete) */}
        {!isEditing && (
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-text-tertiary">
            {user && !comment.parentCommentId && (
              <button
                type="button"
                onClick={() => onReplyClick?.(comment._id)}
                className="hover:text-amber transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Reply className="h-3 w-3" />
                Reply
              </button>
            )}
            {isOwner && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="hover:text-amber transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      {canDelete && !isEditing && (
        <button
          type="button"
          onClick={() => setDeleteTarget(comment._id)}
          className="p-1 rounded-md text-text-tertiary hover:text-danger sm:opacity-0 sm:group-hover/comment:opacity-100 opacity-100 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          aria-label="Delete comment"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

const CommentSection = ({ postId, postOwnerId, comments = [], onCommentsUpdate }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [replyParentId, setReplyParentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});

  // Separate root comments from replies
  const rootComments = comments.filter((c) => !c.parentCommentId);

  const getRepliesForComment = (rootId) => {
    return comments
      .filter((c) => c.parentCommentId?.toString() === rootId.toString())
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        text: trimmed,
        parentCommentId: replyParentId
      });
      if (onCommentsUpdate && response.data.post) {
        onCommentsUpdate(response.data.post.comments);
      }
      setText('');
      setReplyParentId(null);
      toast.success(replyParentId ? 'Reply added' : 'Comment added');
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

  const toggleRepliesExpand = (rootId) => {
    setExpandedReplies((prev) => ({ ...prev, [rootId]: !prev[rootId] }));
  };

  return (
    <section className="space-y-4" aria-label="Comments">
      {/* Add comment / reply form */}
      {user ? (
        <form onSubmit={handleAddComment} className="flex flex-col gap-2">
          {replyParentId && (
            <div className="flex items-center justify-between px-3 py-1 bg-amber/10 border border-amber/20 rounded-lg text-xs text-amber font-medium">
              <span>Replying to comment...</span>
              <button
                type="button"
                onClick={() => setReplyParentId(null)}
                className="text-text-tertiary hover:text-text-primary text-xs"
              >
                Cancel reply
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-xs font-bold text-amber shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40 focus:ring-2 focus:ring-amber/20 transition-all duration-150"
              placeholder={replyParentId ? 'Write a reply…' : 'Write a comment…'}
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
          </div>
        </form>
      ) : (
        <p className="text-sm text-text-tertiary text-center py-2">
          <Link to="/login" className="text-amber hover:underline font-medium">Log in</Link> to join the conversation.
        </p>
      )}

      {/* Root Comments List */}
      <div className="space-y-3 max-h-120 overflow-y-auto">
        {rootComments.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-4">No comments yet. Be the first to share your thoughts.</p>
        ) : (
          rootComments.map((rootComment) => {
            const replies = getRepliesForComment(rootComment._id);
            const isExpanded = expandedReplies[rootComment._id];
            const visibleReplies = isExpanded ? replies : replies.slice(0, 3);
            const hiddenCount = replies.length - 3;

            return (
              <div key={rootComment._id} className="space-y-2">
                {/* Root Comment Item */}
                <CommentItem
                  comment={rootComment}
                  postId={postId}
                  postOwnerId={postOwnerId}
                  user={user}
                  onCommentsUpdate={onCommentsUpdate}
                  setDeleteTarget={setDeleteTarget}
                  onReplyClick={(id) => setReplyParentId(id)}
                />

                {/* Nested Replies List (1-level indented) */}
                {replies.length > 0 && (
                  <div className="pl-6 border-l-2 border-border/60 ml-3 space-y-2">
                    {visibleReplies.map((reply) => (
                      <CommentItem
                        key={reply._id}
                        comment={reply}
                        postId={postId}
                        postOwnerId={postOwnerId}
                        user={user}
                        onCommentsUpdate={onCommentsUpdate}
                        setDeleteTarget={setDeleteTarget}
                      />
                    ))}

                    {/* Collapse / Expand Toggle Button if > 3 replies */}
                    {hiddenCount > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleRepliesExpand(rootComment._id)}
                        className="flex items-center gap-1 text-xs font-medium text-amber hover:underline pt-1 cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3.5 w-3.5" />
                            Hide replies
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3.5 w-3.5" />
                            Show {hiddenCount} more {hiddenCount === 1 ? 'reply' : 'replies'}
                          </>
                        )}
                      </button>
                    )}
                  </div>
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
