import { logger } from '../utils/logger.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

import env from '../config/env.js';

export const protect = async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Get user from the database, excluding password field
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists.' });
    }

    // Account lifecycle safeguards
    if (req.user?.status === 'suspended') {
      return res.status(403).json({ message: 'Account is suspended.' });
    }

    if (req.user?.status === 'deleted') {
      return res.status(403).json({ message: 'Account has been deactivated.' });
    }

    next();
  } catch (error) {
    logger.error(`JWT Verification Error: ${error.message}`);
    return res.status(401).json({ message: 'Not authorized, token failed.' });
  }
};

// Role-based authorization middleware (use after protect)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role) && req.user?.role !== 'founder') {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(', ')}`
      });
    }
    next();
  };
};

// Dedicated Founder authorization middleware
export const checkFounder = (req, res, next) => {
  if (req.user?.role !== 'founder') {
    return res.status(403).json({ message: 'Access denied. Founder privileges required.' });
  }
  next();
};

// Optional authentication middleware for public endpoints
export const optionalAuth = async (req, res, next) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.status !== 'suspended' && user.status !== 'deleted') {
        req.user = user;
      }
    } catch {
      // Token verification errors ignored for optional auth
    }
  }
  next();
};
