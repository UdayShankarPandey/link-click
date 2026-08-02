import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity, FileText, Sparkles, ShieldCheck, TrendingUp, UserPlus } from 'lucide-react';

/**
 * Isolated default placeholder data
 * Can be easily replaced by backend API props in future phases
 */
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
              <span className="text-xs font-semibold text-text-primary truncate block group-hover:text-amber transition-colors">
                {member.name}
              </span>
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
 * Card 3: Community Guidelines
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
 * Card 4: Conditional Trending Creators
 * Rendered ONLY if valid creator data is provided
 */
export const TrendingCreatorsCard = ({ creators }) => {
  if (!creators || creators.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 hover:border-surface-overlay transition-colors duration-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-amber shrink-0" />
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Trending Creators
        </h2>
      </div>

      <div className="space-y-3">
        {creators.map((creator) => (
          <Link
            key={creator.id || creator._id}
            to={`/user/${creator._id || creator.id}`}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-raised transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-xs font-bold text-amber shrink-0 group-hover:border-amber/30 transition-colors">
                {creator.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-text-primary truncate block group-hover:text-amber transition-colors">
                  {creator.name}
                </span>
                <span className="text-[11px] text-text-tertiary block">
                  {creator.postsCount || 0} posts
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

/**
 * Main Composed Sidebar Container
 */
const SidebarWidgets = ({ stats, recentMembers, trendingCreators }) => {
  return (
    <div className="space-y-5">
      <PlatformStatsCard stats={stats} />
      <RecentlyJoinedCard members={recentMembers} />
      <CommunityGuidelinesCard />
      <TrendingCreatorsCard creators={trendingCreators} />
    </div>
  );
};

export default SidebarWidgets;
