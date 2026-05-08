// Use Case: Register a new vehicle

import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { Vehicle, TipoVehiculo, MAX_VEHICLES_PER_USER } from '../../../domain/entities/Vehicle';

export interface CreateVehicleInput {
  userId: string;
  tipo_vehiculo: TipoVehiculo;
  marca: string;
  modelo: string;
  anio: number;
  color?: string;
  placa?: string;
  foto?: string;
  modificaciones?: string;
}

export class CreateVehicleUseCase {
  constructor(private readonly vehicleRepo: IVehicleRepository) {}

  async execute(input: CreateVehicleInput): Promise<Vehicle> {
    // Business rule: max 3 vehicles per user
    const count = await this.vehicleRepo.countByUserId(input.userId);
    if (count >= MAX_VEHICLES_PER_USER) {
      throw new Error('MAX_VEHICLES_REACHED');
    }

    // First vehicle is auto-activated
    const isFirst = count === 0;

    const vehicle = await this.vehicleRepo.create({
      user_id: input.userId,
      tipo_vehiculo: input.tipo_vehiculo,
      marca: input.marca,
      modelo: input.modelo,
      anio: input.anio,
      color: input.color ?? null,
      placa: input.placa ?? null,
      foto: input.foto ?? null,
      modificaciones: input.modificaciones ?? null,
      activo: isFirst,
    });

    return vehicle;
  }
}
