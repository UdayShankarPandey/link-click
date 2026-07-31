import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar, Shield, Link as LinkIcon, Heart, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

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
          description={activeTab === 'posts' ? "This user hasn't shared any posts." : "This user hasn't liked any posts."}
        />
      );
    }
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onLikeUpdate={handleLikeUpdate} />
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
      return <EmptyState title="User not found" description="The user you are looking for does not exist." />;
    }
    return null; // signal to render the full profile below
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-all duration-150 mb-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber rounded">
        <ArrowLeft className="h-4 w-4" />
        Feed
      </Link>

      {renderPageContent() || (
        <div className="animate-fade-in">
          {/* User Header */}
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-7 mb-7">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
              <div className="flex items-center gap-4">
                {userInfo.profilePicUrl ? (
                  <img src={userInfo.profilePicUrl} alt={userInfo.name} className="w-16 h-16 rounded-xl object-cover border border-border shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-xl font-bold text-amber shrink-0">
                    {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-text-primary">{userInfo.name}</h1>
                    {userInfo.role === 'admin' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-muted text-amber text-xs font-semibold">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col text-sm text-text-secondary mt-1 gap-1">
                    <span>{userInfo.linkedBy?.length || 0} Links</span>
                    {userInfo.createdAt && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-text-tertiary" />
                        Joined {new Date(userInfo.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
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
              Posts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('liked')}
              className={`pb-3 px-1 text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-t ${
                activeTab === 'liked' ? 'border-amber text-amber' : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Liked Posts
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
