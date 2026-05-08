// Infrastructure: jsonwebtoken adapter for IJwtService

import jwt from 'jsonwebtoken';
import { IJwtService, JwtPayload } from '../../application/ports/IJwtService';

export class JwtService implements IJwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(secret: string, expiresIn = '7d') {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(payload: JwtPayload): string {
    const { iat, exp, ...rest } = payload;
    return jwt.sign(rest, this.secret, { expiresIn: this.expiresIn } as any);
  }

  verify(token: string): JwtPayload {
    const decoded = jwt.verify(token, this.secret);
    return decoded as JwtPayload;
  }
}
