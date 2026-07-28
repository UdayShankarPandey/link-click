import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Plus, Edit3, Trash2, Shield, User, X, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/users/${deleteTarget}`);
      setUsers(users.filter((u) => u._id !== deleteTarget));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-amber" />
            User Management
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {users.length} registered user{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowCreateForm(true); setEditingUser(null); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber text-text-inverse text-sm font-semibold hover:bg-amber-hover transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-surface border border-border rounded-2xl p-5 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Create New User</h2>
            <button type="button" onClick={() => setShowCreateForm(false)} className="p-1 text-text-tertiary hover:text-text-primary cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>

          {createError && (
            <div className="bg-danger-muted border border-danger/20 text-danger p-3 rounded-xl mb-4 flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{createError}</span>
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
                className="w-full px-3 py-2 bg-canvas border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-amber/40 transition-colors"
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
                className="w-full px-3 py-2 bg-canvas border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-amber/40 transition-colors"
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
                className="w-full px-3 py-2 bg-canvas border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-amber/40 transition-colors"
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
                className="w-full px-3 py-2 bg-canvas border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-amber/40 transition-colors cursor-pointer"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary border border-border hover:bg-surface-raised transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createSubmitting}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-amber text-text-inverse hover:bg-amber-hover disabled:opacity-50 transition-colors cursor-pointer"
              >
                {createSubmitting ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-16 w-full rounded-xl"></div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-text-secondary text-sm">No users found.</div>
      ) : (
        <div className="space-y-2 animate-fade-in">
          {/* Desktop header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_1.5fr_80px_120px] gap-4 px-4 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span className="text-right">Actions</span>
          </div>

          {users.map((u) => (
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
                  <form onSubmit={handleEdit} className="flex flex-col sm:grid sm:grid-cols-[1fr_1.5fr_80px_120px] gap-3 sm:items-end">
                    <div className="flex flex-col gap-1 sm:gap-0 sm:block">
                      <label htmlFor={`edit-name-${u._id}`} className="text-xs text-text-secondary sm:hidden">Name</label>
                      <input
                        id={`edit-name-${u._id}`}
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-canvas border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-amber/40 transition-colors"
                        required
                        maxLength={100}
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-0 sm:block">
                      <label htmlFor={`edit-email-${u._id}`} className="text-xs text-text-secondary sm:hidden">Email</label>
                      <input
                        id={`edit-email-${u._id}`}
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-canvas border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-amber/40 transition-colors"
                        required
                        maxLength={255}
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-0 sm:block">
                      <label htmlFor={`edit-role-${u._id}`} className="text-xs text-text-secondary sm:hidden">Role</label>
                      <select
                        id={`edit-role-${u._id}`}
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full px-3 py-2 bg-canvas border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-amber/40 transition-colors cursor-pointer"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-2 sm:mt-0">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="p-2 rounded-lg text-text-tertiary hover:text-text-primary border border-border hover:bg-surface-raised transition-colors cursor-pointer"
                        aria-label="Cancel edit"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        type="submit"
                        disabled={editSubmitting}
                        className="p-2 rounded-lg bg-amber text-text-inverse hover:bg-amber-hover disabled:opacity-50 transition-colors cursor-pointer"
                        aria-label="Save changes"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* User Row */
                <div className="flex flex-col sm:grid sm:grid-cols-[1fr_1.5fr_80px_120px] gap-3 sm:gap-4 sm:items-center bg-surface border border-border rounded-xl px-4 py-4 sm:py-3 hover:border-surface-overlay transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-sm sm:text-xs font-bold text-amber shrink-0">
                      {u.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex flex-col sm:block min-w-0">
                      <span className="text-sm font-semibold sm:font-medium text-text-primary truncate block">{u.name}</span>
                      <span className="text-xs text-text-secondary truncate sm:hidden block mt-0.5">{u.email}</span>
                    </div>
                  </div>
                  <span className="text-sm text-text-secondary truncate hidden sm:block">{u.email}</span>
                  
                  <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-0 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-border sm:border-0">
                    <span>
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-muted text-amber text-xs font-semibold">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-raised text-text-secondary text-xs font-medium">
                          <User className="h-3 w-3" />
                          User
                        </span>
                      )}
                    </span>
                    <div className="flex sm:justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(u)}
                        className="p-2 rounded-lg text-text-tertiary hover:text-amber hover:bg-amber-muted border border-border sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        aria-label={`Edit ${u.name}`}
                      >
                        <Edit3 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(u._id)}
                        className="p-2 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-muted border border-border sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        aria-label={`Delete ${u.name}`}
                      >
                        <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete user"
        message="This user will be permanently removed. Their posts and comments will remain."
        confirmLabel="Delete User"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminUsers;
