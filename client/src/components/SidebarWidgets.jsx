import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity, FileText, Sparkles, ShieldCheck, TrendingUp, UserPlus, Hash } from 'lucide-react';
import FounderBadge from './FounderBadge';

const DEFAULT_STATS = {
  totalMembers: 128,
  activeMembers: 42,
  postsToday: 15,
};

const DEFAULT_RECENT_MEMBERS = [
  { id: '1', name: 'Alex Rivera', role: 'user', joinedAt: 'Recently' },
  { id: '2', name: 'Sarah Chen', role: 'user', joinedAt: '2h ago' },
  { id: '3', name: 'Marcus Vance', role: 'founder', joinedAt: '1d ago' },
];

/**
 * Card 1: Platform Statistics
 */
export const PlatformStatsCard = ({ stats = DEFAULT_STATS }) => {
  const statItems = [
    { label: 'Total Members', value: stats.totalMembers, icon: Users, color: 'text-amber' },
    { label: 'Active Members', value: stats.activeMembers, icon: Activity, color: 'text-emerald-400' },
    { label: 'Posts Today', value: stats.postsToday, icon: FileText, color: 'text-sky-400' },
  ];

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 hover:border-surface-overlay transition-colors duration-200">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-amber shrink-0" />
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Platform Overview
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={`stat-${item.label}`}
              className="bg-canvas border border-border/60 rounded-xl p-3 text-center flex flex-col items-center justify-center transition-all duration-150 hover:border-border"
            >
              <Icon className={`h-4 w-4 ${item.color} mb-1.5`} />
              <span className="text-base font-extrabold text-text-primary leading-none mb-1">
                {item.value ?? 0}
              </span>
              <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-tight line-clamp-1">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Card 2: Recently Joined Members
 */
export const RecentlyJoinedCard = ({ members = DEFAULT_RECENT_MEMBERS }) => {
  if (!members || members.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 hover:border-surface-overlay transition-colors duration-200">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="h-4 w-4 text-amber shrink-0" />
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Recently Joined
        </h2>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <Link
            key={member.id || member._id}
            to={member._id || member.id ? `/user/${member._id || member.id}` : '#'}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-raised transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-xs font-bold text-amber shrink-0 group-hover:border-amber/30 transition-colors">
              {member.name ? member.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-text-primary truncate block group-hover:text-amber transition-colors">
                  {member.name}
                </span>
                {member.role === 'founder' && <FounderBadge size="xs" />}
              </div>
              <span className="text-[11px] text-text-tertiary block">
                {member.joinedAt || 'Joined recently'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

/**
 * Card 3: Trending Posts Widget
 */
export const TrendingPostsCard = ({ posts = [] }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 hover:border-surface-overlay transition-colors duration-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-amber shrink-0" />
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Trending Posts
        </h2>
      </div>

      <div className="space-y-3">
        {posts.slice(0, 5).map((post) => (
          <Link
            key={post._id}
            to={`/post/${post._id}`}
            className="flex items-start gap-3 p-2 rounded-xl hover:bg-surface-raised transition-colors group"
          >
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-10 h-10 rounded-lg object-cover bg-canvas border border-border/50 shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-text-primary truncate block group-hover:text-amber transition-colors line-clamp-1">
                {post.title}
              </span>
              <span className="text-[11px] text-text-tertiary block">
                By {post.user?.name || 'Anonymous'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

/**
 * Card 4: Suggested Users Widget (Founder First)
 */
export const SuggestedUsersCard = ({ users = [] }) => {
  if (!users || users.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 hover:border-surface-overlay transition-colors duration-200">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-amber shrink-0" />
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Suggested Creators
        </h2>
      </div>

      <div className="space-y-3">
        {users.slice(0, 5).map((user) => (
          <Link
            key={user._id || user.id}
            to={`/user/${user._id || user.id}`}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-raised transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {user.profilePicUrl ? (
                <img
                  src={user.profilePicUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-xs font-bold text-amber shrink-0 group-hover:border-amber/30 transition-colors">
                  {user.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-text-primary truncate block group-hover:text-amber transition-colors">
                    {user.name}
                  </span>
                  {user.role === 'founder' && <FounderBadge size="xs" />}
                </div>
                {user.bio ? (
                  <span className="text-[11px] text-text-tertiary truncate block">
                    {user.bio}
                  </span>
                ) : (
                  <span className="text-[11px] text-text-tertiary block">
                    Member
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

/**
 * Card 5: Popular Hashtags Widget
 */
export const PopularHashtagsCard = ({ hashtags = [], onSelectHashtag }) => {
  if (!hashtags || hashtags.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 hover:border-surface-overlay transition-colors duration-200">
      <div className="flex items-center gap-2 mb-4">
        <Hash className="h-4 w-4 text-amber shrink-0" />
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Popular Hashtags
        </h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {hashtags.slice(0, 10).map((item) => (
          <button
            key={item.tag}
            type="button"
            onClick={() => onSelectHashtag && onSelectHashtag(item.tag)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-canvas border border-border/80 text-xs font-medium text-text-secondary hover:text-amber hover:border-amber/40 transition-colors cursor-pointer"
          >
            <span>{item.tag}</span>
            <span className="text-[10px] text-text-tertiary bg-surface-raised px-1.5 py-0.5 rounded-md">
              {item.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Card 6: Community Guidelines
 */
export const CommunityGuidelinesCard = () => {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 hover:border-surface-overlay transition-colors duration-200">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-4 w-4 text-amber shrink-0" />
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Community Guidelines
        </h2>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed mb-3">
        Link Click is built for authentic community creation. Be respectful, share meaningful visual content, and support fellow members.
      </p>
      <div className="flex items-center gap-2 text-[11px] font-medium text-text-tertiary">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Single-Founder Platform</span>
      </div>
    </div>
  );
};

/**
 * Main Composed Sidebar Container
 */
const SidebarWidgets = ({
  stats,
  recentMembers,
  trendingPosts = [],
  suggestedUsers = [],
  popularHashtags = [],
  onSelectHashtag
}) => {
  return (
    <div className="space-y-5">
      <PlatformStatsCard stats={stats} />
      {trendingPosts.length > 0 && <TrendingPostsCard posts={trendingPosts} />}
      {suggestedUsers.length > 0 && <SuggestedUsersCard users={suggestedUsers} />}
      {popularHashtags.length > 0 && (
        <PopularHashtagsCard hashtags={popularHashtags} onSelectHashtag={onSelectHashtag} />
      )}
      <RecentlyJoinedCard members={recentMembers} />
      <CommunityGuidelinesCard />
    </div>
  );
};

export default SidebarWidgets;
