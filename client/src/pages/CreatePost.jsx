import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Image as ImageIcon, Send, X, Type, FileText, BarChart3, Plus, Trash2, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import PostEditor from '../components/PostEditor';

const DRAFT_KEY = 'link_click_post_draft';

const EXPIRY_PRESETS = [
  { label: '1 day', value: 1 },
  { label: '3 days', value: 3 },
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: 'No expiry', value: null }
];

const CreatePost = () => {
  const [postType, setPostType] = useState('standard'); // 'standard' | 'poll'
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]); // [{ file, previewUrl, url }]
  const [poll, setPoll] = useState({
    question: '',
    options: ['', ''],
    expiryDays: 7
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Load local draft on mount if available
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title || parsed.content || parsed.poll?.question) {
          setDraftPrompt(true);
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  }, []);

  // Auto-save draft to localStorage every 20 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (title || content || poll.question) {
        const draftData = {
          postType,
          title,
          content,
          poll,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      }
    }, 20000);

    return () => clearInterval(timer);
  }, [postType, title, content, poll]);

  const handleRestoreDraft = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.postType) setPostType(parsed.postType);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.content) setContent(parsed.content);
        if (parsed.poll) setPoll(parsed.poll);
        toast.success('Draft restored!');
      }
    } catch {
      toast.error('Failed to restore draft');
    } finally {
      setDraftPrompt(false);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraftPrompt(false);
  };

  // Image Selection Handler (Max 4 images, JPG/PNG/WEBP, max 5MB)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > 4) {
      toast.error('Maximum 4 images allowed per post');
      return;
    }

    const validFiles = [];
    for (const file of files) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported format (JPG, PNG, WEBP)`);
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 50 MB size limit`);
        continue;
      }
      validFiles.push(file);
    }

    const newEntries = validFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newEntries]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setImages(updated);
  };

  // Poll Option Helpers
  const handleOptionChange = (idx, val) => {
    setPoll(prev => {
      const updatedOpts = [...prev.options];
      updatedOpts[idx] = val;
      return { ...prev, options: updatedOpts };
    });
  };

  const addOption = () => {
    if (poll.options.length >= 6) {
      toast.error('Maximum 6 options allowed');
      return;
    }
    setPoll(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const removeOption = (idx) => {
    if (poll.options.length <= 2) {
      toast.error('Polls require at least 2 options');
      return;
    }
    setPoll(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx)
    }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (postType === 'standard' && images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    if (postType === 'poll') {
      if (!poll.question.trim()) {
        toast.error('Poll question is required');
        return;
      }
      const filledOptions = poll.options.filter(o => o.trim().length > 0);
      if (filledOptions.length < 2) {
        toast.error('Please provide at least 2 poll options');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let uploadedImages = [];

      // Step 1: Upload image files if present
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(item => {
          if (item.file) {
            formData.append('images', item.file);
          }
        });

        if (formData.has('images')) {
          const uploadRes = await api.post('/upload/multiple', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          uploadedImages = uploadRes.data.images || [];
        }
      }

      // Step 2: Prepare post payload
      let expiresAt = null;
      if (postType === 'poll' && poll.expiryDays) {
        expiresAt = new Date(Date.now() + poll.expiryDays * 24 * 60 * 60 * 1000).toISOString();
      }

      const postPayload = {
        title: title.trim(),
        content: content.trim(),
        postType,
        images: uploadedImages,
        poll: postType === 'poll' ? {
          question: poll.question.trim(),
          options: poll.options.filter(o => o.trim()).map((optText, i) => ({
            optionId: `opt_${Date.now()}_${i}`,
            text: optText.trim()
          })),
          expiresAt
        } : null
      };

      await api.post('/posts', postPayload);

      localStorage.removeItem(DRAFT_KEY);
      toast.success('Post published successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Draft Restore Notification Banner */}
      {draftPrompt && (
        <div className="mb-6 bg-surface-raised border border-amber/30 rounded-2xl p-4 flex items-center justify-between gap-4 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-amber shrink-0" />
            <p className="text-xs sm:text-sm text-text-primary font-medium">
              You have an unfinished post draft from a previous session.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-3 py-1.5 rounded-xl bg-amber text-text-inverse text-xs font-semibold hover:bg-amber-hover transition-colors"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-3 py-1.5 rounded-xl bg-canvas border border-border text-text-secondary text-xs hover:text-text-primary transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-7 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">New Post</h1>
            <p className="text-sm text-text-secondary mt-1">Share a story or start a community poll</p>
          </div>

          {/* Post Type Selector (Standard vs Poll) */}
          <div className="flex items-center gap-1 p-1 bg-canvas border border-border rounded-xl">
            <button
              type="button"
              onClick={() => setPostType('standard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                postType === 'standard'
                  ? 'bg-amber text-text-inverse shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setPostType('poll')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                postType === 'poll'
                  ? 'bg-amber text-text-inverse shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Poll
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full px-4 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40 focus:ring-2 focus:ring-amber/20 transition-all duration-150"
              placeholder="Give your post a title"
              maxLength={300}
              required
            />
            <div className="text-right text-xs text-text-tertiary mt-1">{title.length}/300</div>
          </div>

          {/* Rich Content Description (PostEditor.jsx) */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-text-secondary mb-1.5">
              <FileText className="h-3.5 w-3.5 text-amber" />
              Description <span className="text-text-tertiary font-normal">(optional)</span>
            </label>
            <PostEditor
              value={content}
              onChange={setContent}
              placeholder="Write your story using bold, italic, or links..."
              maxLength={5000}
            />
          </div>

          {/* Poll Builder (Rendered only if postType === 'poll') */}
          {postType === 'poll' && (
            <div className="bg-canvas border border-border/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-amber" />
                <h3 className="text-sm font-bold text-text-primary">Poll Builder</h3>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Poll Question</label>
                <input
                  type="text"
                  value={poll.question}
                  onChange={(e) => setPoll(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Ask the community a question..."
                  maxLength={300}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-amber"
                />
              </div>

              {/* Options Inputs */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary block">Options (2 to 6)</label>
                {poll.options.map((opt, idx) => (
                  <div key={`poll-opt-input-${idx}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      maxLength={200}
                      className="flex-1 px-3 py-2 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-amber"
                    />
                    {poll.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="p-2 text-text-tertiary hover:text-red-400 rounded-lg hover:bg-surface-raised transition-colors"
                        title="Remove option"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                {poll.options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-amber hover:bg-surface-raised transition-colors mt-2"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Option
                  </button>
                )}
              </div>

              {/* Expiry Selector */}
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5">Poll Duration</label>
                <div className="flex flex-wrap gap-2">
                  {EXPIRY_PRESETS.map((preset) => (
                    <button
                      key={`preset-${preset.label}`}
                      type="button"
                      onClick={() => setPoll(prev => ({ ...prev, expiryDays: preset.value }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        poll.expiryDays === preset.value
                          ? 'border-amber bg-amber/10 text-amber font-semibold'
                          : 'border-border bg-surface text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Multi-Image Upload & Reordering (Max 4 images) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
                <ImageIcon className="h-3.5 w-3.5 text-amber" />
                Images <span className="text-text-tertiary font-normal">(Max 4)</span>
              </label>
              <span className="text-xs text-text-tertiary">{images.length}/4</span>
            </div>

            {/* Image Preview Grid with Reorder Controls */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                {images.map((img, index) => (
                  <div
                    key={`preview-img-${index}`}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-canvas flex items-center justify-center"
                  >
                    <img src={img.previewUrl} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                    
                    {/* Controls Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, index - 1)}
                          className="p-1.5 rounded-lg bg-surface/80 text-white hover:text-amber"
                          title="Move left/up"
                        >
                          <ArrowUp className="h-3.5 w-3.5 sm:rotate-270" />
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, index + 1)}
                          className="p-1.5 rounded-lg bg-surface/80 text-white hover:text-amber"
                          title="Move right/down"
                        >
                          <ArrowDown className="h-3.5 w-3.5 sm:rotate-270" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-1.5 rounded-lg bg-surface/80 text-red-400 hover:text-red-300"
                        title="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {images.length < 4 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-border hover:border-amber/30 bg-canvas/50 hover:bg-canvas rounded-xl p-6 text-center cursor-pointer transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border text-text-tertiary group-hover:text-amber flex items-center justify-center transition-colors">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-text-secondary font-medium">
                    {images.length === 0 ? 'Click to upload images' : 'Add more images'}
                  </p>
                  <p className="text-[11px] text-text-tertiary">JPG, PNG, WEBP — Max 50 MB each</p>
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
                Publish Post
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
