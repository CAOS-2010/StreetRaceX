// Port: Vehicle Repository Interface

import { Vehicle } from '../entities/Vehicle';

export interface IVehicleRepository {
  findById(id: string): Promise<Vehicle | null>;
  findByUserId(userId: string): Promise<Vehicle[]>;
  findActiveByUserId(userId: string): Promise<Vehicle | null>;
  countByUserId(userId: string): Promise<number>;
  create(data: Omit<Vehicle, 'id' | 'created_at'>): Promise<Vehicle>;
  update(id: string, data: Partial<Vehicle>): Promise<Vehicle>;
  delete(id: string): Promise<void>;
  deactivateAllForUser(userId: string): Promise<void>;
}
