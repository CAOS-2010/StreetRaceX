// Middleware: Centralized error handler

import { Request, Response, NextFunction } from 'express';

// Maps domain/application error codes to HTTP status codes
const ERROR_MAP: Record<string, number> = {
  EMAIL_TAKEN: 409,
  USERNAME_TAKEN: 409,
  INVALID_CREDENTIALS: 401,
  ACCOUNT_SUSPENDED: 403,
  USER_NOT_FOUND: 404,
  TARGET_USER_NOT_FOUND: 404,
  VEHICLE_NOT_FOUND: 404,
  CHALLENGE_NOT_FOUND: 404,
  NOTIFICATION_NOT_FOUND: 404,
  FORBIDDEN: 403,
  MAX_VEHICLES_REACHED: 422,
  NO_ACTIVE_VEHICLE: 422,
  RETADOR_NO_ACTIVE_VEHICLE: 422,
  RETADO_NO_ACTIVE_VEHICLE: 422,
  RANK_MISMATCH: 422,
  VEHICLE_TYPE_MISMATCH: 422,
  ACTIVE_CHALLENGE_EXISTS: 409,
  SELF_CHALLENGE_NOT_ALLOWED: 422,
  CHALLENGE_NOT_ACTIVE: 422,
  INVALID_WINNER: 422,
};

const HUMAN_MESSAGES: Record<string, string> = {
  EMAIL_TAKEN: 'Email is already registered',
  USERNAME_TAKEN: 'Username is already taken',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_SUSPENDED: 'Account is suspended',
  USER_NOT_FOUND: 'User not found',
  TARGET_USER_NOT_FOUND: 'Target user not found',
  VEHICLE_NOT_FOUND: 'Vehicle not found',
  CHALLENGE_NOT_FOUND: 'Challenge not found',
  NOTIFICATION_NOT_FOUND: 'Notification not found',
  FORBIDDEN: 'You do not have permission to perform this action',
  MAX_VEHICLES_REACHED: 'Maximum of 3 vehicles per user reached',
  NO_ACTIVE_VEHICLE: 'You need an active vehicle to use this feature',
  RETADOR_NO_ACTIVE_VEHICLE: 'You need an active vehicle to send a challenge',
  RETADO_NO_ACTIVE_VEHICLE: 'The target pilot has no active vehicle',
  RANK_MISMATCH: 'You can only challenge pilots of the same rank',
  VEHICLE_TYPE_MISMATCH: 'Both pilots must have the same type of active vehicle',
  ACTIVE_CHALLENGE_EXISTS: 'There is already an active challenge between these pilots',
  SELF_CHALLENGE_NOT_ALLOWED: 'You cannot challenge yourself',
  CHALLENGE_NOT_ACTIVE: 'The challenge must be accepted or in progress to register a result',
  INVALID_WINNER: 'The winner must be one of the challenge participants',
};

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Handle state transition errors
  const errCode = err.message.startsWith('INVALID_TRANSITION')
    ? 'INVALID_TRANSITION'
    : err.message;

  const statusCode = ERROR_MAP[errCode] ?? 500;
  const humanMessage = HUMAN_MESSAGES[errCode] ?? err.message;

  if (statusCode === 500) {
    console.error('[Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: humanMessage,
    statusCode,
  });
}
