// Infrastructure: Prisma implementation of IVehicleRepository

import { PrismaClient } from '@prisma/client';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { Vehicle } from '../../../domain/entities/Vehicle';

function mapPrismaVehicle(v: any): Vehicle {
  return {
    id: v.id,
    user_id: v.user_id,
    tipo_vehiculo: v.tipo_vehiculo,
    marca: v.marca,
    modelo: v.modelo,
    anio: v.anio,
    color: v.color,
    placa: v.placa,
    foto: v.foto,
    modificaciones: v.modificaciones,
    activo: v.activo,
    created_at: v.created_at,
  };
}

export class PrismaVehicleRepository implements IVehicleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Vehicle | null> {
    const v = await this.prisma.vehicle.findUnique({ where: { id } });
    return v ? mapPrismaVehicle(v) : null;
  }

  async findByUserId(userId: string): Promise<Vehicle[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'asc' },
    });
    return vehicles.map(mapPrismaVehicle);
  }

  async findActiveByUserId(userId: string): Promise<Vehicle | null> {
    const v = await this.prisma.vehicle.findFirst({
      where: { user_id: userId, activo: true },
    });
    return v ? mapPrismaVehicle(v) : null;
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.vehicle.count({ where: { user_id: userId } });
  }

  async create(data: Omit<Vehicle, 'id' | 'created_at'>): Promise<Vehicle> {
    const v = await this.prisma.vehicle.create({ data: data as any });
    return mapPrismaVehicle(v);
  }

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const v = await this.prisma.vehicle.update({
      where: { id },
      data: data as any,
    });
    return mapPrismaVehicle(v);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vehicle.delete({ where: { id } });
  }

  async deactivateAllForUser(userId: string): Promise<void> {
    await this.prisma.vehicle.updateMany({
      where: { user_id: userId },
      data: { activo: false },
    });
  }
}
