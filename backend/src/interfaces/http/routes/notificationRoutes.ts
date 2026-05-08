import { Router, RequestHandler } from 'express';
import { NotificationController } from '../controllers/NotificationController';

export function createNotificationRouter(
  controller: NotificationController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  router.use(authMiddleware);

  // GET /notifications
  router.get('/', controller.getAll);

  // PATCH /notifications/read-all
  router.patch('/read-all', controller.markAllRead);

  // PATCH /notifications/:id/read
  router.patch('/:id/read', controller.markRead);

  return router;
}
