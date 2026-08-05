import { logger } from '../utils/logger.js';
import User from '../models/User.js';
import Post from '../models/Post.js';

// Create a new user (Founder only)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields and types
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Please provide valid name, email and password'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists using the validated email string
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const assignedRole = (role === 'founder' && normalizedEmail === (process.env.FOUNDER_EMAIL || '').trim().toLowerCase()) ? 'founder' : 'user';

    const user = await User.create({
      name,
      email: normalizedEmail,
      password, // Password is hashed automatically by the pre-save hook
      role: assignedRole,
      emailVerified: true
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error(`Create User Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all verified users for roster & management
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ emailVerified: true }, '-password'); // Exclude password from the returned docs
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Get Users Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Get User Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    // Only allow specific fields to be updated (whitelist)
    const allowedFields = ['name', 'email', 'password', 'role'];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Apply allowed updates
    Object.assign(user, updates);

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    logger.error(`Update User Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Delete User Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a user's public profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password -email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Get User Profile Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle Link (Follow/Unfollow)
export const toggleLinkUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot link to yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isLinked = currentUser.links.includes(targetUserId);

    if (isLinked) {
      // Unlink
      currentUser.links = currentUser.links.filter(id => id.toString() !== targetUserId);
      targetUser.linkedBy = targetUser.linkedBy.filter(id => id.toString() !== currentUserId);
    } else {
      // Link
      currentUser.links.push(targetUserId);
      targetUser.linkedBy.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ 
      message: isLinked ? 'Unlinked successfully' : 'Linked successfully',
      isLinked: !isLinked
    });
  } catch (error) {
    logger.error(`Toggle Link Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get suggested users (Founder first, excluding self/suspended/deleted/unverified, max 5, randomized)
export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user?._id?.toString();

    const activeUsers = await User.find(
      {
        emailVerified: true,
        status: { $nin: ['suspended', 'deleted'] }
      },
      'name email role profilePicUrl bio coverPicUrl createdAt updatedAt'
    ).lean();

    const filteredUsers = activeUsers.filter(
      user => user._id.toString() !== currentUserId
    );

    const founders = filteredUsers.filter(user => user.role === 'founder');
    const nonFounders = filteredUsers.filter(user => user.role !== 'founder');
    // NOTE: Math.random() is intentionally used here for lightweight UI presentation randomization of suggested users and is not used for security-sensitive operations.
    nonFounders.sort(() => Math.random() - 0.5);

    const founder = founders.slice(0, 1);
    const suggested = [...founder, ...nonFounders].slice(0, 5);

    res.status(200).json({
      success: true,
      count: suggested.length,
      users: suggested
    });
  } catch (error) {
    logger.error(`Get Suggested Users Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recently joined active verified users (sorted by createdAt descending)
export const getRecentlyJoinedUsers = async (req, res) => {
  try {
    const recentUsers = await User.find(
      { emailVerified: true, status: { $nin: ['suspended', 'deleted'] } },
      'name email role profilePicUrl bio createdAt'
    )
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      count: recentUsers.length,
      users: recentUsers
    });
  } catch (error) {
    logger.error(`Get Recently Joined Users Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get public platform stats (Total Verified Members, Active Verified Members, Posts Today, Total Posts)
export const getPublicPlatformStats = async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({ emailVerified: true });
    const activeMembers = await User.countDocuments({ emailVerified: true, status: { $nin: ['suspended', 'deleted'] } });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const postsToday = await Post.countDocuments({ createdAt: { $gte: startOfDay } });
    const totalPosts = await Post.countDocuments({});

    res.status(200).json({
      success: true,
      stats: {
        totalMembers,
        activeMembers,
        postsToday,
        totalPosts
      }
    });
  } catch (error) {
    logger.error(`Get Public Platform Stats Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

