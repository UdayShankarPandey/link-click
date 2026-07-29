class AppError extends Error {
  constructor(message, statusCode, data) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    if (data) this.data = data;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
