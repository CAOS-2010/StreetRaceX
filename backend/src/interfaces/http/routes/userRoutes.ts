import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { RequestHandler } from 'express';

export function createUserRouter(
  controller: UserController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  // All user routes are private
  router.use(authMiddleware);

  // GET /users/me
  router.get('/me', controller.getMe);

  // PATCH /users/me
  router.patch('/me', controller.updateMe);

  // GET /users/discover
  router.get('/discover', controller.discover);

  // GET /users/:id  (public profile)
  router.get('/:id', controller.getById);

  return router;
}
