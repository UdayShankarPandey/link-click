import asyncHandler from '../utils/asyncHandler.js';
import apiResponse from '../utils/apiResponse.js';
import { authService } from '../services/auth.service.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookie.js';

// Register a new user (does NOT establish a session — email verification required)
export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return apiResponse(res, 201, 'Registration successful. Please check your email to verify your account.', result);
});

// Verify email ownership via POST with token in request body
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return apiResponse(res, 400, 'Verification token is required.');
  }
  const result = await authService.verifyEmail(token);
  return apiResponse(res, 200, result.message);
});

// Resend verification email
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return apiResponse(res, 400, 'Email is required.');
  }
  const result = await authService.resendVerification(email);
  return apiResponse(res, 200, result.message);
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  setAuthCookie(res, result.token);
  return apiResponse(res, 200, 'Login successful.', result);
});

// Logout user
export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  return apiResponse(res, 200, 'Logged out successfully.');
});

// Get current logged-in user's profile
export const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getCurrentUser(req.user._id);
  return apiResponse(res, 200, 'User profile fetched successfully.', result);
});

// Update profile picture
export const updateProfilePic = asyncHandler(async (req, res) => {
  const result = await authService.updateProfilePicture(req.user._id, req.file);
  return apiResponse(res, 200, 'Profile picture updated successfully.', result);
});
