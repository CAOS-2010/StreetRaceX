// Use Case: Mark a vehicle as active (deactivates all others)

import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { Vehicle } from '../../../domain/entities/Vehicle';

export class ActivateVehicleUseCase {
  constructor(private readonly vehicleRepo: IVehicleRepository) {}

  async execute(vehicleId: string, userId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepo.findById(vehicleId);
    if (!vehicle) throw new Error('VEHICLE_NOT_FOUND');
    if (vehicle.user_id !== userId) throw new Error('FORBIDDEN');

    // Deactivate all current vehicles for this user
    await this.vehicleRepo.deactivateAllForUser(userId);

    // Activate the selected vehicle
    return this.vehicleRepo.update(vehicleId, { activo: true });
  }
}
