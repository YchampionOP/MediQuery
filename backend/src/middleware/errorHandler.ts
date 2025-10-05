import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../types/index';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let { statusCode = 500, message, details } = error;

  // Log the error
  logger.error('Error occurred:', {
    error: message,
    statusCode,
    details,
    stack: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = error.details;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if ((error as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse = {
    success: false,
    error: {
      code: error.name || 'InternalServerError',
      message: statusCode === 500 && !isDevelopment ? 'Internal Server Error' : message,
      ...(isDevelopment && { details, stack: error.stack }),
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
      version: '1.0.0',
    },
  };

  res.status(statusCode).json(errorResponse);
};