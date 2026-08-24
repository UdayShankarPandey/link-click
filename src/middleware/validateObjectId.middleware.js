import mongoose from 'mongoose';
import AppError from '../errors/AppError.js';

export const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError(`Invalid ${paramName} format`, 400));
  }
  next();
};
