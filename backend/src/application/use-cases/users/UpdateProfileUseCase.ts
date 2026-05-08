// Use Case: Update own profile

import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { PublicUser, toPublicUser } from '../../../domain/entities/User';

export interface UpdateProfileInput {
  userId: string;
  username?: string;
  foto_perfil?: string;
  zona_localidad?: string;
  zona_ciudad?: string;
  zona_estado?: string;
  zona_pais?: string;
}

export class UpdateProfileUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: UpdateProfileInput): Promise<PublicUser> {
    const { userId, ...updateData } = input;

    // Check username uniqueness if changing
    if (updateData.username) {
      const existing = await this.userRepo.findByUsername(updateData.username);
      if (existing && existing.id !== userId) {
        throw new Error('USERNAME_TAKEN');
      }
    }

    const updated = await this.userRepo.update(userId, updateData);
    return toPublicUser(updated);
  }
}
