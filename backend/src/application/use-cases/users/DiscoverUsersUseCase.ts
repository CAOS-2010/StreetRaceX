// Use Case: Discover pilots of same rank and active vehicle type

import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { PublicUser, toPublicUser } from '../../../domain/entities/User';

export interface DiscoverInput {
  requestingUserId: string;
  zona_ciudad?: string;
  zona_pais?: string;
  page?: number;
  limit?: number;
}

export interface DiscoverOutput {
  users: PublicUser[];
  total: number;
  page: number;
  limit: number;
}

export class DiscoverUsersUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly vehicleRepo: IVehicleRepository,
  ) {}

  async execute(input: DiscoverInput): Promise<DiscoverOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 10;

    // 1. Get the requesting user's rank and active vehicle type
    const me = await this.userRepo.findById(input.requestingUserId);
    if (!me) throw new Error('USER_NOT_FOUND');

    const activeVehicle = await this.vehicleRepo.findActiveByUserId(input.requestingUserId);
    if (!activeVehicle) throw new Error('NO_ACTIVE_VEHICLE');

    // 2. Discover users with same rank + same vehicle type
    const result = await this.userRepo.discover({
      rango: me.rango,
      tipo_vehiculo: activeVehicle.tipo_vehiculo,
      excludeUserId: input.requestingUserId,
      zona_ciudad: input.zona_ciudad,
      zona_pais: input.zona_pais,
      page,
      limit,
    });

    return {
      users: result.users.map(toPublicUser),
      total: result.total,
      page,
      limit,
    };
  }
}
