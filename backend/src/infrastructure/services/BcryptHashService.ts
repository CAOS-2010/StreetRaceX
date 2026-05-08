// Infrastructure: bcrypt adapter for IHashService

import bcrypt from 'bcrypt';
import { IHashService } from '../../application/ports/IHashService';

export class BcryptHashService implements IHashService {
  private readonly rounds: number;

  constructor(rounds = 10) {
    this.rounds = rounds;
  }

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
