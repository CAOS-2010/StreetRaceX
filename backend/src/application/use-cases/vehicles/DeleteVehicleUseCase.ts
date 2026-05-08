// Use Case: Delete vehicle

import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';

export class DeleteVehicleUseCase {
  constructor(private readonly vehicleRepo: IVehicleRepository) {}

  async execute(vehicleId: string, userId: string): Promise<void> {
    const vehicle = await this.vehicleRepo.findById(vehicleId);
    if (!vehicle) throw new Error('VEHICLE_NOT_FOUND');
    if (vehicle.user_id !== userId) throw new Error('FORBIDDEN');

    await this.vehicleRepo.delete(vehicleId);
  }
}
