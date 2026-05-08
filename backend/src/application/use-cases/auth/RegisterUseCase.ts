// Use Case: Register a new user

import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IHashService } from '../../ports/IHashService';
import { IJwtService } from '../../ports/IJwtService';
import { PublicUser, toPublicUser } from '../../../domain/entities/User';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  zona_ciudad?: string;
  zona_pais?: string;
}

export interface RegisterOutput {
  user: PublicUser;
  token: string;
}

export class RegisterUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hashService: IHashService,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    // 1. Check uniqueness
    const existingEmail = await this.userRepo.findByEmail(input.email);
    if (existingEmail) {
      throw new Error('EMAIL_TAKEN');
    }

    const existingUsername = await this.userRepo.findByUsername(input.username);
    if (existingUsername) {
      throw new Error('USERNAME_TAKEN');
    }

    // 2. Hash password
    const password_hash = await this.hashService.hash(input.password);

    // 3. Create user (starts at Rango D)
    const user = await this.userRepo.create({
      username: input.username,
      email: input.email,
      password_hash,
      rango: 'D',
      rol: 'piloto',
      victorias: 0,
      derrotas: 0,
      retos_consecutivos: 0,
      estado: 'activo',
      foto_perfil: null,
      zona_localidad: null,
      zona_ciudad: input.zona_ciudad ?? null,
      zona_estado: null,
      zona_pais: input.zona_pais ?? null,
    });

    // 4. Sign JWT
    const token = this.jwtService.sign({ sub: user.id, role: user.rol });

    return { user: toPublicUser(user), token };
  }
}
