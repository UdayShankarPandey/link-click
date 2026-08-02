import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Plus, Edit3, Trash2, User, X, Save, AlertCircle, Ban, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import FounderBadge from '../components/FounderBadge';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [createError, setCreateError] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', password: '' });
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      setCreateError('Name, email, and password are required.');
      return;
    }
    if (createForm.password.length < 6) {
      setCreateError('Password must be at least 6 characters.');
      return;
    }

    setCreateSubmitting(true);
    setCreateError('');
    try {
      await api.post('/users', createForm);
      toast.success('User created');
      setShowCreateForm(false);
      setCreateForm({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Failed to create user');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const startEdit = (u) => {
    if (u.role === 'founder') {
      toast.error('Founder account cannot be modified.');
      return;
    }
    setEditingUser(u._id);
    setEditForm({ name: u.name, email: u.email, role: u.role, password: '' });
    setEditError('');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email) {
      setEditError('Name and email are required.');
      return;
    }

    setEditSubmitting(true);
    setEditError('');
    try {
      const payload = { name: editForm.name, email: editForm.email, role: editForm.role };
      if (editForm.password) payload.password = editForm.password;
      await api.put(`/users/${editingUser}`, payload);
      toast.success('User updated');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      setEditError(error.response?.data?.message || 'Failed to update user');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    try {
      await api.put(`/dashboard/users/${suspendTarget}/suspend`, { reason: 'Administrative suspension' });
      toast.success('User suspended');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to suspend user');
    } finally {
      setSuspendTarget(null);
    }
  };

  const handleRestore = async (userId) => {
    try {
      await api.put(`/dashboard/users/${userId}/restore`);
      toast.success('User account restored');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restore user');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/dashboard/users/${deleteTarget}/soft-delete`);
      toast.success('User soft deleted');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteTarget(null);
    }
  };

  const renderStatusBadge = (u) => {
    if (u.status === 'suspended') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-danger-muted text-danger text-[11px] font-medium">
          Suspended
        </span>
      );
    }
    if (u.status === 'deleted') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-raised text-text-tertiary text-[11px] font-medium line-through">
          Deleted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-medium">
        Active
      </span>
    );
  };

  const renderUsersContent = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`user-skel-${i}`} className="skeleton h-16 w-full rounded-xl"></div>
          ))}
        </div>
      );
    }
    if (users.length === 0) {
      return <div className="text-center py-16 text-text-secondary text-sm">No users found.</div>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Table Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Users className="h-5 w-5 text-amber" />
            User Roster & Account Governance
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage user accounts, status lifecycle, and permissions ({users.length} total)
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowCreateForm(true); setEditingUser(null); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber text-text-inverse text-xs font-semibold hover:bg-amber-hover transition-all duration-150 cursor-pointer active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-surface border border-border rounded-2xl p-5 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Create New User</h3>
            <button type="button" onClick={() => setShowCreateForm(false)} className="p-1 text-text-tertiary hover:text-text-primary rounded">
              <X className="h-4 w-4" />
            </button>
          </div>

          {createError && (
            <div className="bg-danger-muted border border-danger/20 text-danger p-3 rounded-xl mb-4 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {createError}
            </div>
          )}

          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="create-name" className="block text-xs font-medium text-text-secondary mb-1">Name</label>
              <input
                id="create-name"
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-canvas border border-border rounded-xl text-xs text-text-primary"
                required
                maxLength={100}
              />
            </div>
            <div>
              <label htmlFor="create-email" className="block text-xs font-medium text-text-secondary mb-1">Email</label>
              <input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-canvas border border-border rounded-xl text-xs text-text-primary"
                required
                maxLength={255}
              />
            </div>
            <div>
              <label htmlFor="create-password" className="block text-xs font-medium text-text-secondary mb-1">Password</label>
              <input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="w-full px-3.5 py-2 bg-canvas border border-border rounded-xl text-xs text-text-primary"
                required
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="create-role" className="block text-xs font-medium text-text-secondary mb-1">Role</label>
              <select
                id="create-role"
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                className="w-full px-3.5 py-2 bg-canvas border border-border rounded-xl text-xs text-text-primary"
              >
                <option value="user">User</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-medium text-text-secondary border border-border"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createSubmitting}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-amber text-text-inverse hover:bg-amber-hover"
              >
                {createSubmitting ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      {renderUsersContent() || (
        <div className="space-y-2 animate-fade-in">
          {/* Desktop header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_1.2fr_100px_100px_140px] gap-4 px-4 py-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {users.map((u) => {
            const isFounder = u.role === 'founder';
            const isSuspended = u.status === 'suspended';

            return (
              <div key={u._id}>
                {editingUser === u._id ? (
                  /* Inline Edit Form */
                  <div className="bg-surface border border-amber/20 rounded-xl p-4 animate-fade-in">
                    {editError && (
                      <div className="bg-danger-muted border border-danger/20 text-danger p-2 rounded-lg mb-3 text-xs flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {editError}
                      </div>
                    )}
                    <form onSubmit={handleEdit} className="flex flex-col sm:grid sm:grid-cols-[1fr_1.5fr_100px_120px] gap-3 sm:items-end">
                      <div>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-1.5 bg-canvas border border-border rounded-xl text-xs text-text-primary"
                          required
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-3 py-1.5 bg-canvas border border-border rounded-xl text-xs text-text-primary"
                          required
                          maxLength={255}
                        />
                      </div>
                      <div>
                        <span className="text-xs text-text-tertiary">{editForm.role}</span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary border border-border"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          type="submit"
                          disabled={editSubmitting}
                          className="p-1.5 rounded-lg bg-amber text-text-inverse hover:bg-amber-hover"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* User Row */
                  <div className="flex flex-col sm:grid sm:grid-cols-[1fr_1.2fr_100px_100px_140px] gap-3 sm:gap-4 sm:items-center bg-surface border border-border rounded-xl px-4 py-3 hover:border-surface-overlay transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-xs font-bold text-amber shrink-0">
                        {u.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="text-xs font-semibold text-text-primary truncate">{u.name}</span>
                    </div>
                    <span className="text-xs text-text-secondary truncate hidden sm:block">{u.email}</span>
                    
                    {/* Role */}
                    <div>
                      {isFounder ? (
                        <FounderBadge size="xs" />
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-raised text-text-secondary text-[11px] font-medium">
                          <User className="h-3 w-3" />
                          User
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div>
                      {renderStatusBadge(u)}
                    </div>

                    {/* Action Controls */}
                    <div className="flex justify-end gap-1.5">
                      {isFounder ? (
                        <span className="text-[11px] text-text-tertiary italic">Protected</span>
                      ) : (
                        <>
                          {isSuspended ? (
                            <button
                              type="button"
                              onClick={() => handleRestore(u._id)}
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 border border-border transition-all"
                              title="Restore user account"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSuspendTarget(u._id)}
                              className="p-1.5 rounded-lg text-text-tertiary hover:text-amber hover:bg-amber-muted border border-border transition-all"
                              title="Suspend user account"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => startEdit(u)}
                            className="p-1.5 rounded-lg text-text-tertiary hover:text-amber border border-border transition-all"
                            title="Edit user details"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(u._id)}
                            className="p-1.5 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-muted border border-border transition-all"
                            title="Soft delete user account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Suspend Confirmation */}
      <ConfirmDialog
        open={!!suspendTarget}
        title="Suspend User Account"
        message="This user will be suspended from making posts or comments. They will remain suspended until restored."
        confirmLabel="Suspend User"
        onConfirm={handleSuspend}
        onCancel={() => setSuspendTarget(null)}
      />

      {/* Soft Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Soft Delete User"
        message="This user account will be deactivated and anonymized. Posts and comments will be preserved."
        confirmLabel="Soft Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminUsers;
