import AppError from '../errors/AppError.js';

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      // Map all zod errors into a comma-separated string
      const message = result.error.issues.map(err => err.message).join(', ');
      return next(new AppError(message, 400));
    }
    
    // Replace req.body with the validated and sanitized data
    req.body = result.data;
    next();
  };
};

export default validate;
