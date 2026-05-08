// Port: User Repository Interface
// Domain layer — no infrastructure details

import { User, Rango } from '../entities/User';
import { TipoVehiculo } from '../entities/Vehicle';

export interface DiscoverFilter {
  rango: Rango;
  tipo_vehiculo: TipoVehiculo;
  excludeUserId: string;
  zona_ciudad?: string;
  zona_pais?: string;
  page?: number;
  limit?: number;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  discover(filter: DiscoverFilter): Promise<{ users: User[]; total: number }>;
}
