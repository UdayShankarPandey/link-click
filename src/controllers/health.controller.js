import asyncHandler from '../utils/asyncHandler.js';
import apiResponse from '../utils/apiResponse.js';
import { healthService } from '../services/health.service.js';

export const getHealth = asyncHandler(async (req, res) => {
  const data = healthService.checkHealth();
  return apiResponse(res, 200, 'Server is healthy.', data);
});

export const getReadiness = asyncHandler(async (req, res) => {
  const data = healthService.checkReadiness();
  const statusCode = data.status === 'READY' ? 200 : 503;
  return apiResponse(res, statusCode, 'Readiness status retrieved.', data);
});
