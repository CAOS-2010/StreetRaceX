// Port: JWT Service

export interface JwtPayload {
  sub: string;   // user id
  role: string;
  iat?: number;
  exp?: number;
}

export interface IJwtService {
  sign(payload: JwtPayload): string;
  verify(token: string): JwtPayload;
}
