import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const PollCard = ({ postId, poll, onVoteUpdate }) => {
  const { user } = useAuth();
  const [submittingOption, setSubmittingOption] = useState(null);

  if (!poll || !poll.options) return null;

  const currentUserId = user?._id?.toString() || user?.id?.toString();
  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();

  // Find if user has voted in any option
  let userVotedOptionId = null;
  poll.options.forEach((opt) => {
    if (opt.votes && opt.votes.some((v) => (v._id ? v._id.toString() : v.toString()) === currentUserId)) {
      userVotedOptionId = opt.optionId || opt._id;
    }
  });

  const hasVoted = Boolean(userVotedOptionId) || isExpired;
  const totalVotes = poll.totalVotes || 0;

  const handleVote = async (optionId) => {
    if (!user) {
      toast.error('Please sign in to vote in polls');
      return;
    }
    if (hasVoted) return;

    setSubmittingOption(optionId);
    try {
      const response = await api.post(`/posts/${postId}/vote`, { optionId });
      toast.success('Vote recorded!');
      if (onVoteUpdate) {
        onVoteUpdate(response.data.poll);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record vote');
    } finally {
      setSubmittingOption(null);
    }
  };

  return (
    <div className="bg-canvas border border-border/80 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in my-3">
      {/* Poll Question Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-amber shrink-0" />
          <h4 className="text-sm font-bold text-text-primary tracking-tight">
            {poll.question}
          </h4>
        </div>
        {isExpired && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-raised border border-border text-[10px] font-semibold text-text-tertiary">
            <Clock className="h-3 w-3" />
            Expired
          </span>
        )}
      </div>

      {/* Options List */}
      <div className="space-y-2.5">
        {poll.options.map((opt) => {
          const optId = opt.optionId || opt._id;
          const voteCount = opt.votes ? opt.votes.length : 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isUserChoice = userVotedOptionId === optId;

          return (
            <button
              key={optId}
              type="button"
              disabled={hasVoted || submittingOption === optId}
              onClick={() => handleVote(optId)}
              className={`w-full relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber ${
                isUserChoice
                  ? 'border-amber bg-amber/10 text-text-primary font-semibold'
                  : hasVoted
                  ? 'border-border/60 bg-surface/50 text-text-primary'
                  : 'border-border bg-surface hover:border-amber/40 hover:bg-surface-raised cursor-pointer'
              }`}
            >
              {/* Animated Progress Bar Fill (visible after voting or if expired) */}
              {hasVoted && (
                <div
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-500 rounded-xl ${
                    isUserChoice ? 'bg-amber/20' : 'bg-surface-raised/80'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              )}

              {/* Option Content Overlay */}
              <div className="relative flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  {isUserChoice && <CheckCircle2 className="h-4 w-4 text-amber shrink-0" />}
                  <span className="truncate">{opt.text}</span>
                </div>
                {hasVoted && (
                  <span className="font-mono text-xs font-bold text-text-secondary shrink-0">
                    {percentage}% ({voteCount})
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-text-tertiary pt-1">
        <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
        {poll.expiresAt && !isExpired && (
          <span>Closes {new Date(poll.expiresAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};

export default PollCard;
