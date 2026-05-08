// Middleware: Zod validation factory

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
        statusCode: 400,
      });
      return;
    }
    // Replace with parsed (coerced) data
    req[source] = result.data as any;
    next();
  };
}
