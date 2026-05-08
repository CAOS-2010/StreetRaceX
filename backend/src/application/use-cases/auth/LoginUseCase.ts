// Use Case: Login

import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IHashService } from '../../ports/IHashService';
import { IJwtService } from '../../ports/IJwtService';
import { PublicUser, toPublicUser } from '../../../domain/entities/User';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  user: PublicUser;
  token: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hashService: IHashService,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // 1. Find user
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // 2. Check account status
    if (user.estado === 'suspendido') {
      throw new Error('ACCOUNT_SUSPENDED');
    }

    // 3. Verify password
    const valid = await this.hashService.compare(input.password, user.password_hash);
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // 4. Sign JWT
    const token = this.jwtService.sign({ sub: user.id, role: user.rol });

    return { user: toPublicUser(user), token };
  }
}
