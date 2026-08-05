import asyncHandler from '../utils/asyncHandler.js';
import apiResponse from '../utils/apiResponse.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import AuditLog from '../models/AuditLog.js';
import AppError from '../errors/AppError.js';

// GET /api/dashboard/stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalMembers = await User.countDocuments({ emailVerified: true });
  const activeMembers = await User.countDocuments({ emailVerified: true, status: { $nin: ['suspended', 'deleted'] } });
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const postsToday = await Post.countDocuments({ createdAt: { $gte: startOfDay } });

  return apiResponse(res, 200, 'Dashboard statistics fetched successfully.', {
    totalMembers,
    activeMembers,
    postsToday,
    platformHealth: 'operational',
  });
});

// GET /api/dashboard/logs
export const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find({})
    .populate('actor', 'name email role')
    .populate('targetUser', 'name email role')
    .sort({ createdAt: -1 })
    .limit(100);

  return apiResponse(res, 200, 'Audit logs fetched successfully.', logs);
});

// PUT /api/dashboard/users/:id/suspend
export const suspendUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    throw new AppError('User not found.', 404);
  }

  // Mandatory Safeguard: Founder account is immutable
  if (targetUser.role === 'founder') {
    throw new AppError('Founder account cannot be suspended or altered.', 403);
  }

  targetUser.status = 'suspended';
  targetUser.suspendedAt = new Date();
  targetUser.suspensionReason = req.body.reason || 'Administrative suspension';
  await targetUser.save();

  await AuditLog.create({
    action: 'USER_SUSPEND',
    actor: req.user._id,
    targetUser: targetUser._id,
    reason: req.body.reason || 'Administrative suspension',
  });

  return apiResponse(res, 200, 'User account suspended successfully.', targetUser);
});

// PUT /api/dashboard/users/:id/restore
export const restoreUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    throw new AppError('User not found.', 404);
  }

  if (targetUser.role === 'founder') {
    throw new AppError('Founder account cannot be altered.', 403);
  }

  targetUser.status = 'active';
  targetUser.suspendedAt = undefined;
  targetUser.suspensionReason = '';
  await targetUser.save();

  await AuditLog.create({
    action: 'USER_RESTORE',
    actor: req.user._id,
    targetUser: targetUser._id,
    reason: 'Account restored by Founder',
  });

  return apiResponse(res, 200, 'User account restored successfully.', targetUser);
});

// DELETE /api/dashboard/users/:id/soft-delete
export const softDeleteUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    throw new AppError('User not found.', 404);
  }

  // Mandatory Safeguard: Founder account cannot be soft deleted
  if (targetUser.role === 'founder') {
    throw new AppError('Founder account cannot be deleted.', 403);
  }

  targetUser.status = 'deleted';
  targetUser.name = 'Deleted User';
  targetUser.email = `deleted_${targetUser._id}@linkclick.internal`;
  await targetUser.save();

  await AuditLog.create({
    action: 'USER_SOFT_DELETE',
    actor: req.user._id,
    targetUser: targetUser._id,
    reason: req.body.reason || 'Soft deleted by Founder',
  });

  return apiResponse(res, 200, 'User account soft deleted successfully.');
});
