import { jest } from '@jest/globals';
import { validateObjectId } from './validateObjectId.middleware.js';
import mongoose from 'mongoose';
import AppError from '../errors/AppError.js';

describe('validateObjectId Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {} };
    res = {};
    next = jest.fn();
  });

  it('should call next if param is a valid ObjectId', () => {
    req.params.id = new mongoose.Types.ObjectId().toHexString();
    const middleware = validateObjectId('id');
    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should call next with AppError if param is an invalid ObjectId', () => {
    req.params.id = 'invalid-id-123';
    const middleware = validateObjectId('id');
    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(400);
    expect(next.mock.calls[0][0].message).toBe('Invalid id format');
  });

  it('should call next if param is missing (should be caught by route matching)', () => {
    const middleware = validateObjectId('id');
    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});
