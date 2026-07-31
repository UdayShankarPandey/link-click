import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Image as ImageIcon, Send, X, Type, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!imageFile) {
      toast.error('An image is required');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('image', imageFile);

    try {
      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Post published!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-7 animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">New Post</h1>
          <p className="text-sm text-text-secondary mt-1">Share a visual story with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="post-title" className="flex items-center gap-1.5 text-sm font-medium text-text-secondary mb-1.5">
              <Type className="h-3.5 w-3.5 text-amber" />
              Title
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40 focus:ring-2 focus:ring-amber/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Give your post a title"
              maxLength={300}
              required
            />
            <div className="text-right text-xs text-text-tertiary mt-1">{title.length}/300</div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="post-content" className="flex items-center gap-1.5 text-sm font-medium text-text-secondary mb-1.5">
              <FileText className="h-3.5 w-3.5 text-amber" />
              Description <span className="text-text-tertiary font-normal">(optional)</span>
            </label>
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40 focus:ring-2 focus:ring-amber/20 transition-all duration-150 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="What's this about?"
              maxLength={10000}
            />
            <div className="text-right text-xs text-text-tertiary mt-1">{content.length}/10000</div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-text-secondary mb-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-amber" />
              Cover Image
            </label>

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border bg-canvas">
                <img src={imagePreview} alt="Preview" className="w-full max-h-72 object-contain mx-auto" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-1.5 bg-canvas/80 backdrop-blur-sm text-text-secondary hover:text-text-primary rounded-lg border border-border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber active:scale-95"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-border hover:border-amber/30 bg-canvas/50 hover:bg-canvas rounded-xl p-8 text-center cursor-pointer transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:border-amber/50"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-surface-raised border border-border text-text-tertiary group-hover:text-amber flex items-center justify-center transition-colors">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-text-secondary font-medium">Click to upload</p>
                  <p className="text-xs text-text-tertiary">PNG, JPG, JPEG — Max 5 MB</p>
                </div>
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber hover:bg-amber-hover text-text-inverse font-semibold py-2.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.99]"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-text-inverse border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Publish
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
