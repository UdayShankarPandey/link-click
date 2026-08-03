import React from 'react';

export const WidgetSkeleton = () => (
  <div className="bg-surface rounded-2xl border border-border p-5 space-y-3 animate-pulse">
    <div className="skeleton h-4 w-32 rounded"></div>
    <div className="space-y-2">
      <div className="skeleton h-8 w-full rounded-xl"></div>
      <div className="skeleton h-8 w-full rounded-xl"></div>
      <div className="skeleton h-8 w-full rounded-xl"></div>
    </div>
  </div>
);

export const FeedHeaderSkeleton = () => (
  <div className="flex items-center gap-2 mb-6 border-b border-border pb-3 animate-pulse">
    <div className="skeleton h-8 w-24 rounded-xl"></div>
    <div className="skeleton h-8 w-24 rounded-xl"></div>
    <div className="skeleton h-8 w-24 rounded-xl"></div>
  </div>
);

const SKELETON_PROFILE_KEYS = [
  'skel-profile-card-alpha',
  'skel-profile-card-beta',
  'skel-profile-card-gamma',
  'skel-profile-card-delta'
];

const Skeleton = ({ variant = 'post', count = 1 }) => {
  if (variant === 'widget') {
    return <WidgetSkeleton />;
  }

  if (variant === 'feed-header') {
    return <FeedHeaderSkeleton />;
  }

  if (variant === 'post') {
    const postKeys = Array.from({ length: count }, (_, idx) => `skel-post-card-token-${idx + 1}`);
    return postKeys.map((keyId) => (
      <div key={keyId} className="bg-surface rounded-2xl overflow-hidden border border-border">
        {/* Image skeleton */}
        <div className="skeleton w-full aspect-16/10"></div>
        {/* Content skeleton */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="skeleton w-9 h-9 rounded-lg shrink-0"></div>
            <div className="space-y-1.5 flex-1">
              <div className="skeleton h-3.5 w-24"></div>
              <div className="skeleton h-2.5 w-32"></div>
            </div>
          </div>
          <div className="skeleton h-5 w-3/4"></div>
          <div className="skeleton h-3.5 w-full"></div>
        </div>
        {/* Engagement bar skeleton */}
        <div className="px-4 sm:px-5 pb-4 flex items-center gap-5">
          <div className="skeleton h-4 w-12 rounded"></div>
          <div className="skeleton h-4 w-12 rounded"></div>
        </div>
      </div>
    ));
  }

  if (variant === 'sidebar') {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
          <div className="skeleton h-4 w-32 rounded"></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="skeleton h-16 rounded-xl"></div>
            <div className="skeleton h-16 rounded-xl"></div>
            <div className="skeleton h-16 rounded-xl"></div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
          <div className="skeleton h-4 w-36 rounded"></div>
          <div className="skeleton h-10 w-full rounded-xl"></div>
          <div className="skeleton h-10 w-full rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="skeleton w-full aspect-video rounded-2xl"></div>
        <div className="space-y-3 px-1">
          <div className="skeleton h-8 w-3/4"></div>
          <div className="flex items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-lg"></div>
            <div className="space-y-1.5">
              <div className="skeleton h-3.5 w-28"></div>
              <div className="skeleton h-2.5 w-20"></div>
            </div>
          </div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-1/2"></div>
        </div>
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-5">
            <div className="skeleton w-20 h-20 rounded-xl"></div>
            <div className="space-y-2 flex-1">
              <div className="skeleton h-6 w-40"></div>
              <div className="skeleton h-3.5 w-56"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SKELETON_PROFILE_KEYS.map((keyId) => (
            <div key={keyId} className="bg-surface rounded-2xl overflow-hidden border border-border">
              <div className="skeleton w-full aspect-video"></div>
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-3/4"></div>
                <div className="skeleton h-3 w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default Skeleton;
