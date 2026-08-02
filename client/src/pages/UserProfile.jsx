import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar, Link as LinkIcon, Heart, Camera, Pin, Code2, Share2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import FounderBadge from '../components/FounderBadge';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLinked, setIsLinked] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchPosts(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeTab]);

  const fetchUser = async () => {
    setLoadingUser(true);
    try {
      const response = await api.get(`/users/${id}/profile`);
      setUserInfo(response.data);
      if (currentUser && response.data.linkedBy) {
        setIsLinked(response.data.linkedBy.includes(currentUser.id || currentUser._id));
      }
    } catch {
      toast.error('Failed to load user profile');
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchPosts = async (p) => {
    setLoadingPosts(true);
    try {
      const endpoint = activeTab === 'posts' ? `/posts/user/${id}?page=${p}&limit=12` : `/posts/user/${id}/liked?page=${p}&limit=12`;
      const response = await api.get(endpoint);
      setPosts(response.data.posts || []);
      setTotalPages(response.data.totalPages || 1);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleToggleLink = async () => {
    setIsLinking(true);
    try {
      const response = await api.post(`/users/${id}/link`);
      setIsLinked(response.data.isLinked);
      toast.success(response.data.message);
      
      // Update link count
      setUserInfo(prev => ({
        ...prev,
        linkedBy: response.data.isLinked 
          ? [...(prev.linkedBy || []), currentUser.id || currentUser._id]
          : (prev.linkedBy || []).filter(linkId => linkId !== (currentUser.id || currentUser._id))
      }));
    } catch {
      toast.error('Failed to link user');
    } finally {
      setIsLinking(false);
    }
  };

  const handleLikeUpdate = (postId, newLikes) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, likes: newLikes } : p))
    );
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchPosts(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSelf = currentUser && (currentUser.id === id || currentUser._id === id);
  const totalLikesReceived = posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);

  const renderPostsSection = () => {
    if (loadingPosts) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton variant="post" count={6} />
        </div>
      );
    }
    if (posts.length === 0) {
      return (
        <EmptyState
          icon={activeTab === 'posts' ? Camera : Heart}
          title={activeTab === 'posts' ? "No posts yet" : "No liked posts"}
          description={activeTab === 'posts' ? "This member hasn't shared any posts yet." : "This member hasn't liked any posts yet."}
        />
      );
    }

    // Sort posts so pinned post appears first if active tab is posts
    const sortedPosts = [...posts];
    if (activeTab === 'posts' && userInfo?.pinnedPost) {
      sortedPosts.sort((a, b) => (b._id === userInfo.pinnedPost ? 1 : 0) - (a._id === userInfo.pinnedPost ? 1 : 0));
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {sortedPosts.map((post) => (
            <div key={post._id} className="relative">
              {userInfo?.pinnedPost === post._id && activeTab === 'posts' && (
                <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg bg-amber text-text-inverse text-[11px] font-bold flex items-center gap-1 shadow-md">
                  <Pin className="h-3 w-3 fill-text-inverse" />
                  <span>Pinned Post</span>
                </div>
              )}
              <PostCard post={post} onLikeUpdate={handleLikeUpdate} />
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </>
    );
  };

  const renderPageContent = () => {
    if (loadingUser) {
      return <Skeleton variant="profile" />;
    }
    if (!userInfo) {
      return <EmptyState title="User not found" description="The member profile you are looking for does not exist." />;
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-all duration-150 mb-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded">
        <ArrowLeft className="h-4 w-4" />
        Feed
      </Link>

      {renderPageContent() || (
        <div className="animate-fade-in space-y-6">
          {/* User Header Card */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {/* Cover Image Container */}
            <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 overflow-hidden border-b border-border relative">
              {userInfo.coverPicUrl && (
                <img src={userInfo.coverPicUrl} alt="Cover Banner" className="w-full h-full object-cover" />
              )}
            </div>

            {/* User Info Details */}
            <div className="p-5 sm:p-7 pt-0 sm:pt-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 mb-5">
                {/* Avatar */}
                {userInfo.profilePicUrl ? (
                  <img src={userInfo.profilePicUrl} alt={userInfo.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-surface shadow-xl shrink-0" />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface-raised border-4 border-surface shadow-xl flex items-center justify-center text-4xl font-extrabold text-amber shrink-0">
                    {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}

                {/* Link Toggle Button */}
                {!isSelf && currentUser && (
                  <button
                    type="button"
                    onClick={handleToggleLink}
                    disabled={isLinking}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-[0.98] ${
                      isLinked 
                      ? 'bg-surface-raised text-text-primary border border-border hover:border-danger hover:text-danger hover:bg-danger-muted' 
                      : 'bg-amber text-text-inverse hover:bg-amber-hover'
                    }`}
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span className="group-hover:hidden">{isLinked ? 'Linked' : 'Link'}</span>
                    <span className="hidden group-hover:inline">{isLinked ? 'Unlink' : 'Link'}</span>
                  </button>
                )}
              </div>

              {/* User Bio & Details */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">{userInfo.name}</h1>
                  {userInfo.role === 'founder' && <FounderBadge size="md" />}
                </div>

                {userInfo.bio ? (
                  <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">{userInfo.bio}</p>
                ) : (
                  <p className="text-xs text-text-tertiary italic">Member of the Link Click community.</p>
                )}

                {userInfo.createdAt && (
                  <div className="flex items-center gap-1.5 text-xs text-text-tertiary pt-1">
                    <Calendar className="h-3.5 w-3.5 text-text-tertiary" />
                    Joined {new Date(userInfo.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                )}

                {/* Social Links (Rendered ONLY if valid URL present; never display blank placeholders) */}
                {userInfo.socials && (userInfo.socials.github || userInfo.socials.twitter || userInfo.socials.website) && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {userInfo.socials.github && (
                      <a
                        href={userInfo.socials.github.startsWith('http') ? userInfo.socials.github : `https://github.com/${userInfo.socials.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-canvas border border-border text-xs text-text-secondary hover:text-amber hover:border-amber/30 transition-colors"
                      >
                        <Code2 className="h-3.5 w-3.5 text-amber" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {userInfo.socials.twitter && (
                      <a
                        href={userInfo.socials.twitter.startsWith('http') ? userInfo.socials.twitter : `https://x.com/${userInfo.socials.twitter}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-canvas border border-border text-xs text-text-secondary hover:text-amber hover:border-amber/30 transition-colors"
                      >
                        <Share2 className="h-3.5 w-3.5 text-amber" />
                        <span>X / Twitter</span>
                      </a>
                    )}
                    {userInfo.socials.website && (
                      <a
                        href={userInfo.socials.website.startsWith('http') ? userInfo.socials.website : `https://${userInfo.socials.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-canvas border border-border text-xs text-text-secondary hover:text-amber hover:border-amber/30 transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5 text-amber" />
                        <span>Portfolio</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Statistics Bar */}
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
                    <span className="text-base font-extrabold text-amber block">{userInfo.linkedBy?.length || 0}</span>
                    <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Links</span>
                  </div>
                </div>
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
              Posts ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('liked')}
              className={`pb-3 px-1 text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-t ${
                activeTab === 'liked' ? 'border-amber text-amber' : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Liked Posts ({posts.length})
            </button>
          </div>

          {/* Posts */}
          {renderPostsSection()}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
