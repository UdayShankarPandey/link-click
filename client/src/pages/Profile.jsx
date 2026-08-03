import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Calendar, Heart, MessageSquare, Trash2, Edit3, Camera, Image, X, Pin, Globe, Code2, Share2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import FounderBadge from '../components/FounderBadge';
import ProfileCompletionBar from '../components/ProfileCompletionBar';

const Profile = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  
  // Image Upload States
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Edit Profile Form State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    github: user?.socials?.github || '',
    twitter: user?.socials?.twitter || '',
    website: user?.socials?.website || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEditForm({
      name: user.name || '',
      bio: user.bio || '',
      github: user.socials?.github || '',
      twitter: user.socials?.twitter || '',
      website: user.socials?.website || '',
    });
    fetchPostsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  const fetchPostsData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'posts') {
        const response = await api.get(`/posts/user/${user.id || user._id}`);
        setPosts(response.data.posts || response.data);
      } else if (activeTab === 'liked') {
        const response = await api.get(`/posts/user/${user.id || user._id}/liked`);
        setLikedPosts(response.data.posts || response.data);
      } else if (activeTab === 'saved') {
        const response = await api.get('/posts/bookmarked');
        setBookmarkedPosts(response.data.posts || []);
      }
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingAvatar(true);
    try {
      await api.put('/auth/me/profile-pic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile picture updated!');
      window.location.reload(); 
    } catch {
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingCover(true);
    try {
      await api.put('/auth/me/cover-pic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Cover image updated!');
      window.location.reload();
    } catch {
      toast.error('Failed to upload cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleRemoveCover = async () => {
    setUploadingCover(true);
    try {
      await api.delete('/auth/me/cover-pic');
      toast.success('Cover image removed');
      window.location.reload();
    } catch {
      toast.error('Failed to remove cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveProfileDetails = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/auth/me/profile', {
        name: editForm.name,
        bio: editForm.bio,
        socials: {
          github: editForm.github,
          twitter: editForm.twitter,
          website: editForm.website,
        }
      });
      toast.success('Profile details saved');
      setShowEditModal(false);
      window.location.reload();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTogglePinPost = async (postId) => {
    const newPinnedId = user.pinnedPost === postId ? null : postId;
    try {
      await api.put('/auth/me/profile', { pinnedPost: newPinnedId });
      toast.success(newPinnedId ? 'Post pinned to profile' : 'Post unpinned');
      window.location.reload();
    } catch {
      toast.error('Failed to update pinned post');
    }
  };

  const handleDeletePost = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/posts/${deleteTarget}`);
      setPosts(posts.filter((p) => p._id !== deleteTarget));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (!user) return null;

  const currentPosts = activeTab === 'posts' ? posts : activeTab === 'liked' ? likedPosts : bookmarkedPosts;
  const totalLikesReceived = posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);

  const renderCoverBanner = () => (
    <div className="relative h-36 sm:h-48 w-full bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 overflow-hidden border-b border-border group">
      {user.coverPicUrl ? (
        <img
          src={user.coverPicUrl}
          alt="Cover Banner"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-text-tertiary text-xs font-medium bg-canvas/30">
          <span>No cover banner image set</span>
        </div>
      )}

      <div className="absolute top-3 right-3 flex items-center gap-2">
        <label
          htmlFor="cover-upload-input"
          className="px-3 py-1.5 rounded-xl bg-canvas/80 backdrop-blur-md border border-border text-xs font-semibold text-text-primary hover:text-amber cursor-pointer transition-all duration-150 flex items-center gap-1.5 shadow-md"
        >
          <Image className="h-3.5 w-3.5" />
          <span>{user.coverPicUrl ? 'Change Cover' : 'Add Cover'}</span>
          <input
            id="cover-upload-input"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleCoverUpload}
            disabled={uploadingCover}
          />
        </label>
        {user.coverPicUrl && (
          <button
            type="button"
            onClick={handleRemoveCover}
            disabled={uploadingCover}
            className="p-1.5 rounded-xl bg-canvas/80 backdrop-blur-md border border-border text-text-tertiary hover:text-danger transition-all duration-150 shadow-md"
            title="Remove cover image"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  const renderAvatarSection = () => (
    <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 mb-5">
      <div className="relative group shrink-0">
        {user.profilePicUrl ? (
          <img
            src={user.profilePicUrl}
            alt={user.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-surface shadow-xl"
          />
        ) : (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface-raised border-4 border-surface shadow-xl flex items-center justify-center text-4xl font-extrabold text-amber">
            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
        )}
        <label
          htmlFor="avatar-upload-input"
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center cursor-pointer"
        >
          {uploadingAvatar ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
          <input
            id="avatar-upload-input"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={uploadingAvatar}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setShowEditModal(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-raised border border-border text-xs font-semibold text-text-primary hover:border-amber/40 hover:text-amber transition-all duration-150 active:scale-95"
      >
        <Edit3 className="h-3.5 w-3.5" />
        Edit Profile
      </button>
    </div>
  );

  const renderSocialLinks = () => {
    if (!user.socials || (!user.socials.github && !user.socials.twitter && !user.socials.website)) {
      return null;
    }
    return (
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {user.socials.github && (
          <a
            href={user.socials.github.startsWith('http') ? user.socials.github : `https://github.com/${user.socials.github}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-canvas border border-border text-xs text-text-secondary hover:text-amber hover:border-amber/30 transition-colors"
          >
            <Code2 className="h-3.5 w-3.5 text-amber" />
            <span>GitHub</span>
          </a>
        )}
        {user.socials.twitter && (
          <a
            href={user.socials.twitter.startsWith('http') ? user.socials.twitter : `https://x.com/${user.socials.twitter}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-canvas border border-border text-xs text-text-secondary hover:text-amber hover:border-amber/30 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5 text-amber" />
            <span>X / Twitter</span>
          </a>
        )}
        {user.socials.website && (
          <a
            href={user.socials.website.startsWith('http') ? user.socials.website : `https://${user.socials.website}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-canvas border border-border text-xs text-text-secondary hover:text-amber hover:border-amber/30 transition-colors"
          >
            <Globe className="h-3.5 w-3.5 text-amber" />
            <span>Portfolio</span>
          </a>
        )}
      </div>
    );
  };

  const renderStatsBar = () => (
    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border mt-4">
      <div className="bg-canvas border border-border/60 rounded-xl p-3 text-center">
        <span className="text-base font-extrabold text-text-primary block">{posts.length}</span>
        <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Posts</span>
      </div>
      <div className="bg-canvas border border-border/60 rounded-xl p-3 text-center">
        <span className="text-base font-extrabold text-coral block">{totalLikesReceived}</span>
        <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Likes Received</span>
      </div>
      <div className="bg-canvas border border-border/60 rounded-xl p-3 text-center">
        <span className="text-base font-extrabold text-amber block">{user.linkedBy?.length || 0}</span>
        <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Links</span>
      </div>
    </div>
  );

  const renderPostsContent = () => {
    if (loading) {
      return <Skeleton variant="profile" />;
    }
    if (currentPosts.length === 0) {
      return (
        <EmptyState
          icon={activeTab === 'posts' ? Camera : Heart}
          title={activeTab === 'posts' ? "No posts yet" : "No liked posts"}
          description={activeTab === 'posts' ? "Your published visual stories will appear here." : "Posts you like will appear here."}
          actionLabel={activeTab === 'posts' ? "Create your first post" : "Explore feed"}
          actionTo={activeTab === 'posts' ? "/create" : "/"}
        />
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
        {currentPosts.map((post) => {
          const isPinned = user.pinnedPost === post._id;
          return (
            <div
              key={post._id}
              className={`bg-surface border rounded-2xl overflow-hidden hover:border-surface-overlay transition-all duration-200 group flex flex-col ${
                isPinned ? 'border-amber/50 ring-1 ring-amber/20' : 'border-border'
              }`}
            >
              <div className="relative aspect-video overflow-hidden bg-canvas">
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-tertiary text-xs">
                    No preview
                  </div>
                )}

                {isPinned && (
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-amber text-text-inverse text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </span>
                )}

                {activeTab === 'posts' && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleTogglePinPost(post._id)}
                      className={`p-1.5 rounded-lg border backdrop-blur-md transition-colors ${
                        isPinned
                          ? 'bg-amber text-text-inverse border-amber'
                          : 'bg-canvas/80 text-text-primary border-border hover:border-amber/40 hover:text-amber'
                      }`}
                      title={isPinned ? 'Unpin post' : 'Pin post to profile'}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                    <Link
                      to={`/edit/${post._id}`}
                      className="p-1.5 rounded-lg bg-canvas/80 backdrop-blur-md border border-border text-text-primary hover:border-amber/40 hover:text-amber transition-colors"
                      title="Edit post"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(post._id)}
                      className="p-1.5 rounded-lg bg-canvas/80 backdrop-blur-md border border-border text-text-tertiary hover:text-danger hover:border-danger/30 transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <Link to={`/post/${post._id}`}>
                    <h3 className="text-sm font-bold text-text-primary group-hover:text-amber transition-colors line-clamp-1 mb-1">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-3">
                    {post.caption}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-text-tertiary">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-coral" />
                      {post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5 text-amber" />
                      {post.comments?.length || 0}
                    </span>
                  </div>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderEditModal = () => {
    if (!showEditModal) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-text-primary">Edit Profile Details</h2>
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="p-1 text-text-tertiary hover:text-text-primary rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSaveProfileDetails} className="space-y-4">
            <div>
              <label
                htmlFor="profile-name-input"
                className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1"
              >
                Display Name
              </label>
              <input
                id="profile-name-input"
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber/40"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label
                htmlFor="profile-bio-input"
                className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1"
              >
                Bio (max 280 chars)
              </label>
              <textarea
                id="profile-bio-input"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber/40 resize-none h-20"
                maxLength={280}
                placeholder="Share a short bio with the community..."
              />
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Social Links
              </span>

              <div>
                <label
                  htmlFor="profile-github-input"
                  className="block text-[11px] font-medium text-text-tertiary mb-1"
                >
                  GitHub Handle or URL
                </label>
                <input
                  id="profile-github-input"
                  type="text"
                  value={editForm.github}
                  onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                  className="w-full px-3.5 py-2 bg-canvas border border-border rounded-xl text-xs text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40"
                  placeholder="GitHub username or URL"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-twitter-input"
                  className="block text-[11px] font-medium text-text-tertiary mb-1"
                >
                  X / Twitter Handle or URL
                </label>
                <input
                  id="profile-twitter-input"
                  type="text"
                  value={editForm.twitter}
                  onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                  className="w-full px-3.5 py-2 bg-canvas border border-border rounded-xl text-xs text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40"
                  placeholder="X / Twitter handle or URL"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-website-input"
                  className="block text-[11px] font-medium text-text-tertiary mb-1"
                >
                  Portfolio or Website URL
                </label>
                <input
                  id="profile-website-input"
                  type="text"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  className="w-full px-3.5 py-2 bg-canvas border border-border rounded-xl text-xs text-text-primary placeholder-text-tertiary focus:outline-none focus:border-amber/40"
                  placeholder="Portfolio or Website URL"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary border border-border hover:bg-surface-raised"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-amber text-text-inverse hover:bg-amber-hover disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Profile Completion Indicator */}
      <ProfileCompletionBar user={user} />

      {/* Main Profile Header Card */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-8 animate-fade-in">
        {renderCoverBanner()}

        {/* Profile Info Details Header */}
        <div className="p-5 sm:p-7 pt-0 sm:pt-0">
          {renderAvatarSection()}

          {/* User Details */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">{user.name}</h1>
              {user.role === 'founder' && <FounderBadge size="md" />}
            </div>

            {/* Bio */}
            {user.bio ? (
              <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">{user.bio}</p>
            ) : (
              <p className="text-xs text-text-tertiary italic">No biography added yet.</p>
            )}

            {/* Email & Joined Date */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-text-tertiary pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-text-tertiary" />
                {user.email}
              </span>
              {user.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-text-tertiary" />
                  Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>

            {renderSocialLinks()}
            {renderStatsBar()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-t ${
            activeTab === 'posts' ? 'border-amber text-amber' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          My Posts ({posts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('liked')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-t ${
            activeTab === 'liked' ? 'border-amber text-amber' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Liked Posts ({likedPosts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-t ${
            activeTab === 'saved' ? 'border-amber text-amber' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Saved Posts ({user.bookmarks?.length || bookmarkedPosts.length})
        </button>
      </div>

      {/* Posts Grid */}
      <div className="space-y-5">
        {renderPostsContent()}
      </div>

      {/* Edit Profile Details Modal */}
      {renderEditModal()}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete post"
        message="This post and all its comments will be permanently removed. This cannot be undone."
        confirmLabel="Delete Post"
        onConfirm={handleDeletePost}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Profile;
