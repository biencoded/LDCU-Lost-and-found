import { Request, Response, NextFunction } from 'express';

/**
 * Error handling middleware
 * Catches errors from route handlers and formats responses
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error.message);

  res.status(500).json({
    error: error.message || 'Internal server error',
    code: 'SERVER_ERROR',
  });
}

/**
 * Request validation middleware
 * Checks that JSON body is provided for POST/PUT requests
 */
export function validateJsonBody(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (['POST', 'PUT'].includes(req.method) && !req.body) {
    res.status(400).json({ error: 'Request body is required' });
    return;
  }
  next();
}

/**
 * Request logging middleware
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
}

/**
 * Database not ready middleware
 * Returns 503 if database is not initialized
 */
export function checkDatabaseReady(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // TODO: Check if database pool is ready
  // If not, return 503
  next();
}
