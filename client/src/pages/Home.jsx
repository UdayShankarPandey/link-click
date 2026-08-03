import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Camera, TrendingUp, Clock, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import Skeleton, { WidgetSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import SidebarWidgets from '../components/SidebarWidgets';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'latest', label: 'Latest', icon: Clock },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'popular', label: 'Popular', icon: Flame },
];

const Home = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('latest');
  const activeTabRef = useRef(activeTab);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  // Keep ref synchronized with activeTab
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Pagination state (primarily for 'latest' tab)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  // Sidebar widget data state
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [popularHashtags, setPopularHashtags] = useState([]);

  // Fetch feed posts according to active tab
  const fetchPosts = useCallback(async (tab, currentPage) => {
    setLoading(true);
    try {
      let endpoint = `/posts?page=${currentPage}&limit=12`;
      if (tab === 'trending') {
        endpoint = '/posts/trending?limit=12';
      } else if (tab === 'popular') {
        endpoint = '/posts/popular?limit=12';
      }

      const response = await api.get(endpoint);

      // Guard against race conditions during rapid tab switching
      if (tab !== activeTabRef.current) return;

      const data = response.data;

      if (tab === 'latest') {
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);
        setTotalPosts(data.totalPosts || 0);
      } else {
        setPosts(data.posts || []);
        setTotalPages(1);
        setTotalPosts(data.count || data.posts?.length || 0);
      }
    } catch {
      if (tab === activeTabRef.current) {
        toast.error('Failed to load feed posts');
        setPosts([]);
      }
    } finally {
      if (tab === activeTabRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch sidebar widget data
  const fetchSidebarData = useCallback(async () => {
    setSidebarLoading(true);
    try {
      const [trendingRes, hashtagsRes] = await Promise.allSettled([
        api.get('/posts/trending?limit=5'),
        api.get('/posts/hashtags/popular?limit=10')
      ]);

      if (trendingRes.status === 'fulfilled') {
        setTrendingPosts(trendingRes.value.data.posts || []);
      }
      if (hashtagsRes.status === 'fulfilled') {
        setPopularHashtags(hashtagsRes.value.data.hashtags || []);
      }

      // Fetch suggested users if authenticated
      if (user) {
        try {
          const suggestedRes = await api.get('/users/suggested');
          setSuggestedUsers(suggestedRes.data.users || []);
        } catch {
          // Non-critical endpoint error fallback
        }
      }
    } catch {
      // Non-critical sidebar error fallback
    } finally {
      setSidebarLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts(activeTab, page);
  }, [activeTab, page, fetchPosts]);

  useEffect(() => {
    fetchSidebarData();
  }, [fetchSidebarData]);

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
    setPage(1);
  };

  const handleLikeUpdate = (postId, newLikes) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, likes: newLikes } : p))
    );
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderFeedContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton variant="post" count={6} />
        </div>
      );
    }

    if (posts.length === 0) {
      if (activeTab === 'trending') {
        return <EmptyState preset="empty-trending" />;
      }
      if (activeTab === 'popular') {
        return <EmptyState preset="empty-popular" />;
      }
      return (
        <EmptyState
          icon={Camera}
          title="No posts yet"
          description="Be the first to share a visual story with the community."
          actionLabel={user ? 'Create a Post' : 'Sign Up to Post'}
          actionTo={user ? '/create' : '/register'}
          suggestions={['Visual Stories', 'Community Photos', 'Design Snippets']}
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
        {activeTab === 'latest' && totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </>
    );
  };

  const getSubtitleText = (count, tab) => {
    if (count <= 0) return 'Visual stories from the Link Click community';
    const noun = count === 1 ? 'post' : 'posts';
    return `${count} ${noun} in ${tab}`;
  };

  const subtitleText = getSubtitleText(totalPosts, activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <header className="mb-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              {user ? `Welcome back, ${user.name?.split(' ')[0]}` : 'Explore'}
            </h1>
            <p className="text-text-secondary mt-1 text-sm sm:text-base">
              {subtitleText}
            </p>
          </div>
          {user && (
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber text-text-inverse text-sm font-semibold hover:bg-amber-hover transition-all duration-150 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.98]"
            >
              <Camera className="h-4 w-4" />
              New Post
            </Link>
          )}
        </div>

        {/* Feed Navigation Tabs (Latest, Trending, Popular) */}
        <nav
          role="tablist"
          aria-label="Feed view navigation"
          className="flex items-center gap-2 mt-6 border-b border-border pb-3 overflow-x-auto"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                  isActive
                    ? 'bg-amber text-text-inverse shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Main Feed Column */}
        <main id={`panel-${activeTab}`} role="tabpanel" className="min-w-0">
          {renderFeedContent()}
        </main>

        {/* Desktop Sidebar Column */}
        <aside className="hidden lg:block sticky top-24">
          {sidebarLoading ? (
            <div className="space-y-5">
              <WidgetSkeleton />
              <WidgetSkeleton />
            </div>
          ) : (
            <SidebarWidgets
              stats={{ totalMembers: 128, activeMembers: 42, postsToday: totalPosts }}
              trendingPosts={trendingPosts}
              suggestedUsers={suggestedUsers}
              popularHashtags={popularHashtags}
            />
          )}
        </aside>
      </div>
    </div>
  );
};

export default Home;
