import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CheckEmail from './pages/CheckEmail';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import EditPost from './pages/EditPost';
import UserProfile from './pages/UserProfile';
import AdminUsers from './pages/AdminUsers';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-canvas text-text-primary flex flex-col font-sans">
          <Navbar />
          
          <main className="flex-1">
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

              {/* Admin Routes */}
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsers />
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
