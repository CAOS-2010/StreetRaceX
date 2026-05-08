// Controller: Vehicles

import { Request, Response, NextFunction } from 'express';
import { CreateVehicleUseCase } from '../../../application/use-cases/vehicles/CreateVehicleUseCase';
import { UpdateVehicleUseCase } from '../../../application/use-cases/vehicles/UpdateVehicleUseCase';
import { DeleteVehicleUseCase } from '../../../application/use-cases/vehicles/DeleteVehicleUseCase';
import { ActivateVehicleUseCase } from '../../../application/use-cases/vehicles/ActivateVehicleUseCase';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';

export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
    private readonly activateVehicleUseCase: ActivateVehicleUseCase,
    private readonly vehicleRepo: IVehicleRepository,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicle = await this.createVehicleUseCase.execute({
        userId: req.userId!,
        ...req.body,
      });
      res.status(201).json({ success: true, data: vehicle, message: 'Vehicle registered' });
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicles = await this.vehicleRepo.findByUserId(req.userId!);
      res.status(200).json({ success: true, data: vehicles, message: 'Vehicles retrieved' });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicle = await this.updateVehicleUseCase.execute({
        vehicleId: req.params.id,
        userId: req.userId!,
        ...req.body,
      });
      res.status(200).json({ success: true, data: vehicle, message: 'Vehicle updated' });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteVehicleUseCase.execute(req.params.id, req.userId!);
      res.status(200).json({ success: true, data: null, message: 'Vehicle deleted' });
    } catch (err) {
      next(err);
    }
  };

  activate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicle = await this.activateVehicleUseCase.execute(req.params.id, req.userId!);
      res.status(200).json({ success: true, data: vehicle, message: 'Vehicle activated' });
    } catch (err) {
      next(err);
    }
  };
}
