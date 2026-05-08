// Port: Hash Service — allows bcrypt to be swapped at infrastructure level

export interface IHashService {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}
