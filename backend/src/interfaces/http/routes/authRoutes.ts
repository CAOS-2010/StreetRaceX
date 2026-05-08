import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middlewares/validateMiddleware';
import { registerSchema, loginSchema } from '../validators/authValidators';

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  // POST /auth/register
  router.post('/register', validate(registerSchema), controller.register);

  // POST /auth/login
  router.post('/login', validate(loginSchema), controller.login);

  return router;
}
