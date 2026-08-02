import React from 'react';
import { Sparkles } from 'lucide-react';

const ProfileCompletionBar = ({ user }) => {
  if (!user) return null;

  const hasAvatar = Boolean(user.profilePicUrl);
  const hasCover = Boolean(user.coverPicUrl);
  const hasBio = Boolean(user.bio && user.bio.trim().length > 0);
  const hasSocials = Boolean(
    user.socials &&
    (user.socials.github || user.socials.twitter || user.socials.website)
  );

  const completedCount = [hasAvatar, hasCover, hasBio, hasSocials].filter(Boolean).length;
  const percentage = completedCount * 25;

  if (percentage === 100) return null; // Fully complete, keep UI clean

  const getMissingHint = () => {
    if (!hasAvatar) return 'Upload an avatar';
    if (!hasCover) return 'Add a cover image';
    if (!hasBio) return 'Write a brief bio';
    if (!hasSocials) return 'Add your social handles';
    return 'Complete your profile';
  };

  return (
    <div className="bg-surface/80 border border-border rounded-2xl p-4 mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber shrink-0" />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Profile Strength ({percentage}%)
          </span>
        </div>
        <span className="text-xs text-amber font-medium">
          Next step: {getMissingHint()}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-canvas rounded-full h-2 overflow-hidden border border-border/50">
        <div
          className="bg-amber h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProfileCompletionBar;
