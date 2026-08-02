import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ShieldCheck, Users, Activity, FileText, PlusCircle, UserCheck, LayoutGrid, Settings, Clock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminUsers from './AdminUsers';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, postsToday: 0, platformHealth: 'operational' });
  const [logs, setLogs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await api.get('/dashboard/logs');
      setLogs(response.data);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-amber" />
            Founder Dashboard
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Platform operational overview, user governance, and security audit logs.
          </p>
        </div>

        {/* Platform Health Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-text-primary shrink-0 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Platform Health: Operational</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-border mb-8 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'overview' ? 'border-amber text-amber' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'users' ? 'border-amber text-amber' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Users className="h-4 w-4" />
          Users
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'logs' ? 'border-amber text-amber' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Clock className="h-4 w-4" />
          Audit Logs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'settings' ? 'border-amber text-amber' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-surface border border-border rounded-2xl p-5 hover:border-surface-overlay transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Total Members</span>
                <Users className="h-5 w-5 text-amber" />
              </div>
              <span className="text-3xl font-extrabold text-text-primary block">
                {loadingStats ? '...' : stats.totalMembers}
              </span>
              <span className="text-xs text-text-tertiary mt-1 block">Registered platform accounts</span>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-5 hover:border-surface-overlay transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Active Members</span>
                <Activity className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-3xl font-extrabold text-text-primary block">
                {loadingStats ? '...' : stats.activeMembers}
              </span>
              <span className="text-xs text-text-tertiary mt-1 block">Active non-suspended accounts</span>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-5 hover:border-surface-overlay transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Posts Today</span>
                <FileText className="h-5 w-5 text-sky-400" />
              </div>
              <span className="text-3xl font-extrabold text-text-primary block">
                {loadingStats ? '...' : stats.postsToday}
              </span>
              <span className="text-xs text-text-tertiary mt-1 block">Created in last 24 hours</span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                to="/create"
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-canvas border border-border hover:border-amber/40 hover:text-amber transition-all text-center group"
              >
                <PlusCircle className="h-6 w-6 text-amber mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-text-primary group-hover:text-amber">Create Post</span>
              </Link>

              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-canvas border border-border hover:border-amber/40 hover:text-amber transition-all text-center group cursor-pointer"
              >
                <UserCheck className="h-6 w-6 text-amber mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-text-primary group-hover:text-amber">Manage Users</span>
              </button>

              <Link
                to="/profile"
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-canvas border border-border hover:border-amber/40 hover:text-amber transition-all text-center group"
              >
                <Users className="h-6 w-6 text-amber mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-text-primary group-hover:text-amber">View Profile</span>
              </Link>

              <Link
                to="/"
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-canvas border border-border hover:border-amber/40 hover:text-amber transition-all text-center group"
              >
                <LayoutGrid className="h-6 w-6 text-amber mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-text-primary group-hover:text-amber">Go to Feed</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users (Composes and embeds AdminUsers.jsx) */}
      {activeTab === 'users' && (
        <div className="animate-fade-in">
          <AdminUsers />
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-surface border border-border rounded-2xl p-6 animate-fade-in">
          <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber" />
            Security Audit Trail
          </h2>

          {loadingLogs ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-12 w-full rounded-xl"></div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <p className="text-xs text-text-tertiary text-center py-12">No audit log entries recorded yet.</p>
          ) : (
            <div className="space-y-2">
              <div className="hidden sm:grid sm:grid-cols-[140px_1fr_1.2fr_1.5fr] gap-4 px-4 py-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider border-b border-border mb-2">
                <span>Action</span>
                <span>Actor</span>
                <span>Target User</span>
                <span>Timestamp</span>
              </div>

              {logs.map((log) => (
                <div key={log._id} className="flex flex-col sm:grid sm:grid-cols-[140px_1fr_1.2fr_1.5fr] gap-2 sm:gap-4 items-start sm:items-center bg-canvas border border-border/60 rounded-xl p-3.5 text-xs text-text-secondary">
                  <span className="font-semibold text-amber uppercase text-[10px] tracking-wide px-2 py-0.5 rounded bg-amber-muted shrink-0">
                    {log.action}
                  </span>
                  <span className="font-medium text-text-primary truncate">{log.actor?.name || 'System'}</span>
                  <span className="truncate">{log.targetUser?.name || '-'}</span>
                  <span className="text-text-tertiary text-[11px]">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Settings (Placeholder) */}
      {activeTab === 'settings' && (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center animate-fade-in">
          <Settings className="h-8 w-8 text-amber mx-auto mb-3" />
          <h2 className="text-base font-bold text-text-primary mb-1">Founder Platform Settings</h2>
          <p className="text-xs text-text-tertiary max-w-sm mx-auto">
            Placeholder panel for future platform configuration, system preferences, and feature flags.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
