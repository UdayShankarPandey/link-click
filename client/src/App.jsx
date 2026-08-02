import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import FounderRoute from './components/FounderRoute';
import Skeleton from './components/Skeleton';

// Pages (Core critical paths loaded synchronously)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CheckEmail from './pages/CheckEmail';
import VerifyEmail from './pages/VerifyEmail';
import PostDetail from './pages/PostDetail';

// Lazy Loaded Pages (Code-split for performance)
const Profile = lazy(() => import('./pages/Profile'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const EditPost = lazy(() => import('./pages/EditPost'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-canvas text-text-primary flex flex-col font-sans">
          <Navbar />
          
          <main className="flex-1">
            <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-8"><Skeleton variant="post" count={2} /></div>}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/check-email" element={<CheckEmail />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/post/:id" element={<PostDetail />} />
                <Route path="/user/:id" element={<UserProfile />} />

                {/* Protected Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create"
                  element={
                    <ProtectedRoute>
                      <CreatePost />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post/:id/edit"
                  element={
                    <ProtectedRoute>
                      <EditPost />
                    </ProtectedRoute>
                  }
                />

                {/* Founder Dashboard Route */}
                <Route element={<FounderRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>

                {/* Admin Legacy Route mapping to Dashboard */}
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <Dashboard />
                    </AdminRoute>
                  }
                />
                
                {/* 404 */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in">
                      <h2 className="text-3xl font-bold text-text-primary mb-2">404</h2>
                      <p className="text-text-secondary mb-6">This page doesn't exist.</p>
                      <a href="/" className="text-amber hover:underline font-medium text-sm">← Back to feed</a>
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1a1f',
              color: '#F5F0E8',
              border: '1px solid #2a2a30',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#E8A838',
                secondary: '#111113',
              },
            },
            error: {
              iconTheme: {
                primary: '#D35454',
                secondary: '#111113',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
};

export default App;
