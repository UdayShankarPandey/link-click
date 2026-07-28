import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, PlusSquare, User, LogOut, LogIn, UserPlus, Menu, X, Shield, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive(path)
        ? 'text-amber bg-amber-muted'
        : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
    }`;

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-canvas/90 backdrop-blur-md border-b border-border" role="navigation" aria-label="Main navigation">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={closeMobile}>
            <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
              <Camera className="h-4 w-4 text-text-inverse" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-extrabold text-text-primary tracking-tight">
              Link<span className="text-amber"> Click</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={navLinkClass('/')}>
              <Home className="h-4 w-4" />
              <span>Feed</span>
            </Link>

            {user ? (
              <>
                <Link to="/create" className={navLinkClass('/create')}>
                  <PlusSquare className="h-4 w-4" />
                  <span>Create</span>
                </Link>

                <Link to="/profile" className={navLinkClass('/profile')}>
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>

                {user.role === 'admin' && (
                  <Link to="/admin/users" className={navLinkClass('/admin/users')}>
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}

                <div className="w-px h-6 bg-border mx-1"></div>

                <div className="flex items-center gap-1 pl-1">
                  {user.profilePicUrl ? (
                    <img src={user.profilePicUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-border shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-surface-raised border border-border flex items-center justify-center text-xs font-bold text-amber shrink-0">
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger-muted transition-colors duration-150 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass('/login')}>
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>

                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-amber text-text-inverse hover:bg-amber-hover transition-colors duration-150"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            <Link to="/" className={navLinkClass('/')} onClick={closeMobile}>
              <Home className="h-4 w-4" />
              <span>Feed</span>
            </Link>

            {user ? (
              <>
                <Link to="/create" className={navLinkClass('/create')} onClick={closeMobile}>
                  <PlusSquare className="h-4 w-4" />
                  <span>Create Post</span>
                </Link>
                <Link to="/profile" className={navLinkClass('/profile')} onClick={closeMobile}>
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin/users" className={navLinkClass('/admin/users')} onClick={closeMobile}>
                    <Shield className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <div className="border-t border-border my-2"></div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-danger hover:bg-danger-muted transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass('/login')} onClick={closeMobile}>
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
                <Link to="/register" className={navLinkClass('/register')} onClick={closeMobile}>
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
