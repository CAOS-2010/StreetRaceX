import { Router, RequestHandler } from 'express';
import { ChallengeController } from '../controllers/ChallengeController';
import { validate } from '../middlewares/validateMiddleware';
import {
  createChallengeSchema,
  updateChallengeStatusSchema,
  registerResultSchema,
} from '../validators/challengeValidators';

export function createChallengeRouter(
  controller: ChallengeController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  router.use(authMiddleware);

  // POST /challenges
  router.post('/', validate(createChallengeSchema), controller.create);

  // GET /challenges/history
  router.get('/history', controller.getHistory);

  // PATCH /challenges/:id/status
  router.patch('/:id/status', validate(updateChallengeStatusSchema), controller.updateStatus);

  // POST /challenges/:id/result
  router.post('/:id/result', validate(registerResultSchema), controller.registerResult);

  // DELETE /challenges/:id  (cancel)
  router.delete('/:id', controller.cancel);

  return router;
}
