// Middleware: JWT authentication

import { Request, Response, NextFunction } from 'express';
import { IJwtService } from '../../../application/ports/IJwtService';

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

export function createAuthMiddleware(jwtService: IJwtService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authorization token required',
        statusCode: 401,
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwtService.verify(token);
      req.userId = payload.sub;
      req.userRole = payload.role;
      next();
    } catch {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        statusCode: 401,
      });
    }
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.userRole !== 'administrador') {
    res.status(403).json({
      success: false,
      error: 'Admin access required',
      statusCode: 403,
    });
    return;
  }
  next();
}
