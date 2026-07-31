import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Type, FileText, Image as ImageIcon, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton from '../components/Skeleton';

const EditPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        const post = response.data;
        const userId = user?.id || user?._id;
        if (post.user?._id !== userId) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }
        setTitle(post.title || '');
        setContent(post.content || '');
        setCurrentImageUrl(post.imageUrl || '');
      } catch (error) {
        if (error.response?.status === 404) setNotFound(true);
        else toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchPost();
  }, [id, user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5 MB');
        return;
      }
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setNewImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeNewImage = () => {
    setNewImageFile(null);
    setNewImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSubmitting(true);

    try {
      if (newImageFile) {
        // Multipart form upload when image changes
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('content', content.trim());
        formData.append('image', newImageFile);
        await api.put(`/posts/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // JSON update for text-only changes
        await api.put(`/posts/${id}`, {
          title: title.trim(),
          content: content.trim(),
        });
      }
      toast.success('Post updated!');
      navigate(`/post/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Skeleton variant="detail" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <h2 className="text-xl font-bold text-text-primary mb-2">Post not found</h2>
        <Link to="/" className="text-amber hover:underline font-medium text-sm">← Back to feed</Link>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <h2 className="text-xl font-bold text-text-primary mb-2">Not authorized</h2>
        <p className="text-sm text-text-secondary mb-6">You can only edit your own posts.</p>
        <Link to="/" className="text-amber hover:underline font-medium text-sm">← Back to feed</Link>
      </div>
    );
  }

  const displayImage = newImagePreview || currentImageUrl;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 animate-fade-in">
      <Link to={`/post/${id}`} className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber rounded">
        <ArrowLeft className="h-4 w-4" />
        Back to post
      </Link>

      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-7">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">Edit Post</h1>
        <p className="text-sm text-text-secondary mb-6">Update your post's title, description, or cover image</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="edit-title" className="flex items-center gap-1.5 text-sm font-medium text-text-secondary mb-1.5">
              <Type className="h-3.5 w-3.5 text-amber" />
              Title
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40 focus:ring-1 focus:ring-amber/20 transition-colors"
              maxLength={300}
              required
            />
            <div className="text-right text-xs text-text-tertiary mt-1">{title.length}/300</div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="edit-content" className="flex items-center gap-1.5 text-sm font-medium text-text-secondary mb-1.5">
              <FileText className="h-3.5 w-3.5 text-amber" />
              Description
            </label>
            <textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40 focus:ring-1 focus:ring-amber/20 transition-colors resize-none"
              maxLength={10000}
            />
            <div className="text-right text-xs text-text-tertiary mt-1">{content.length}/10000</div>
          </div>

          {/* Image */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-text-secondary mb-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-amber" />
              Cover Image
            </label>

            {displayImage && (
              <div className="relative rounded-xl overflow-hidden border border-border bg-canvas mb-3">
                <img src={displayImage} alt="Current" className="w-full max-h-64 object-contain mx-auto" />
                {newImagePreview && (
                  <button
                    type="button"
                    onClick={removeNewImage}
                    className="absolute top-3 right-3 p-1.5 bg-canvas/80 backdrop-blur-sm rounded-lg text-text-secondary hover:text-text-primary border border-border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber active:scale-95"
                    aria-label="Remove new image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-amber hover:text-amber-hover font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber rounded"
            >
              {currentImageUrl ? 'Replace image' : 'Upload image'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-amber hover:bg-amber-hover text-text-inverse font-semibold py-2.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.99]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-text-inverse border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
            <Link
              to={`/post/${id}`}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary bg-canvas border border-border hover:bg-surface-raised hover:text-text-primary transition-all duration-150 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.99]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
