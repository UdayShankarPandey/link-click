import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import SidebarWidgets from '../components/SidebarWidgets';
import toast from 'react-hot-toast';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const fetchPosts = async (p) => {
    setLoading(true);
    try {
      const response = await api.get(`/posts?page=${p}&limit=12`);
      setPosts(response.data.posts || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalPosts(response.data.totalPosts || 0);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
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

  const postWord = totalPosts === 1 ? 'post' : 'posts';
  const subtitleText = totalPosts > 0
    ? `${totalPosts} ${postWord} shared by the community`
    : 'Visual stories from the Link Click community';

  const renderFeedContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton variant="post" count={6} />
        </div>
      );
    }
    if (posts.length === 0) {
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
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <header className="mb-8 animate-fade-in">
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
      </header>

      {/* Main 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Main Feed Column */}
        <main className="min-w-0">
          {renderFeedContent()}
        </main>

        {/* Desktop Sidebar Column */}
        <aside className="hidden lg:block sticky top-24">
          <SidebarWidgets stats={{ totalMembers: 128, activeMembers: 42, postsToday: totalPosts }} />
        </aside>
      </div>
    </div>
  );
};

export default Home;
