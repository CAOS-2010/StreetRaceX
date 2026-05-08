import { Router, RequestHandler } from 'express';
import { VehicleController } from '../controllers/VehicleController';
import { validate } from '../middlewares/validateMiddleware';
import { createVehicleSchema, updateVehicleSchema } from '../validators/vehicleValidators';

export function createVehicleRouter(
  controller: VehicleController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  router.use(authMiddleware);

  // POST /vehicles
  router.post('/', validate(createVehicleSchema), controller.create);

  // GET /vehicles
  router.get('/', controller.getAll);

  // PATCH /vehicles/:id
  router.patch('/:id', validate(updateVehicleSchema), controller.update);

  // DELETE /vehicles/:id
  router.delete('/:id', controller.delete);

  // PATCH /vehicles/:id/activate
  router.patch('/:id/activate', controller.activate);

  return router;
}
