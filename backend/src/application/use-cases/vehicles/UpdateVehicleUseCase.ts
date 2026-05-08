// Use Case: Update vehicle info

import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { Vehicle } from '../../../domain/entities/Vehicle';

export interface UpdateVehicleInput {
  vehicleId: string;
  userId: string;  // ownership check
  marca?: string;
  modelo?: string;
  anio?: number;
  color?: string;
  foto?: string;
  modificaciones?: string;
}

export class UpdateVehicleUseCase {
  constructor(private readonly vehicleRepo: IVehicleRepository) {}

  async execute(input: UpdateVehicleInput): Promise<Vehicle> {
    const { vehicleId, userId, ...updateData } = input;

    const vehicle = await this.vehicleRepo.findById(vehicleId);
    if (!vehicle) throw new Error('VEHICLE_NOT_FOUND');
    if (vehicle.user_id !== userId) throw new Error('FORBIDDEN');

    return this.vehicleRepo.update(vehicleId, updateData);
  }
}
