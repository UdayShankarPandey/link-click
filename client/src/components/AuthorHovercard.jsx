import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowUpRight } from 'lucide-react';
import api from '../services/api';

/**
 * Module-level in-memory cache to store user profile details by ID
 * Prevents redundant API requests on repeated hovers across cards
 */
const userProfileCache = new Map();

const AuthorHovercard = ({ author, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [profileData, setProfileData] = useState(author || {});
  const [loading, setLoading] = useState(false);
  const hoverTimerRef = useRef(null);

  const authorId = author?._id || author?.id;

  useEffect(() => {
    // Keep baseline author data up-to-date from props
    setProfileData((prev) => ({ ...author, ...prev }));
  }, [author]);

  const fetchProfileDetails = async () => {
    if (!authorId) return;

    // Check module-level cache first
    if (userProfileCache.has(authorId)) {
      setProfileData((prev) => ({ ...prev, ...userProfileCache.get(authorId) }));
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/users/${authorId}/profile`);
      const fetched = response.data;
      userProfileCache.set(authorId, fetched);
      setProfileData((prev) => ({ ...prev, ...fetched }));
    } catch {
      // Silently fall back to existing author props
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setIsVisible(true);
      // Fetch extra details (e.g. bio, join date) if missing from post author payload
      if (!profileData.bio && !profileData.createdAt) {
        fetchProfileDetails();
      }
    }, 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 150);
  };

  const formatJoinedDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const joinedDate = formatJoinedDate(profileData.createdAt);
  const isFounder = profileData.role === 'founder';

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Anchor trigger */}
      {children}

      {/* Popover Card */}
      {isVisible && (
        <div
          className="absolute left-0 bottom-full mb-2 w-64 bg-surface border border-border rounded-2xl p-4 shadow-xl z-30 animate-fade-in pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header row */}
          <div className="flex items-start gap-3 mb-3">
            {profileData.profilePicUrl ? (
              <img
                src={profileData.profilePicUrl}
                alt={profileData.name}
                className="w-11 h-11 rounded-xl object-cover border border-border shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-base font-bold text-amber shrink-0">
                {profileData.name ? profileData.name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-text-primary truncate">
                  {profileData.name || 'Unknown Author'}
                </span>
                {isFounder && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber bg-amber-muted px-1.5 py-0.5 rounded"
                    title="Platform Founder"
                  >
                    👑
                  </span>
                )}
              </div>
              {joinedDate && (
                <span className="flex items-center gap-1 text-[11px] text-text-tertiary mt-0.5">
                  <Calendar className="h-3 w-3" />
                  Joined {joinedDate}
                </span>
              )}
            </div>
          </div>

          {/* Bio Preview */}
          {loading ? (
            <div className="space-y-1.5 mb-3">
              <div className="skeleton h-3 w-3/4 rounded"></div>
              <div className="skeleton h-3 w-1/2 rounded"></div>
            </div>
          ) : profileData.bio ? (
            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-3">
              {profileData.bio}
            </p>
          ) : (
            <p className="text-xs text-text-tertiary italic mb-3">
              Member of the Link Click community.
            </p>
          )}

          {/* Action Footer */}
          <Link
            to={authorId ? `/user/${authorId}` : '#'}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-raised border border-border text-xs font-semibold text-text-primary hover:border-amber/40 hover:text-amber transition-colors"
          >
            <span>View Profile</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default AuthorHovercard;
