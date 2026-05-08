// Use Case: Get user profile (own or public)

import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { PublicUser, toPublicUser } from '../../../domain/entities/User';
import { Vehicle } from '../../../domain/entities/Vehicle';

export interface ProfileOutput {
  user: PublicUser;
  vehicles: Vehicle[];
}

export class GetProfileUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly vehicleRepo: IVehicleRepository,
  ) {}

  async execute(targetId: string): Promise<ProfileOutput> {
    const user = await this.userRepo.findById(targetId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const vehicles = await this.vehicleRepo.findByUserId(targetId);

    return { user: toPublicUser(user), vehicles };
  }
}
