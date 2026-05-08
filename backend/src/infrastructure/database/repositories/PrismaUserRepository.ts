// Infrastructure: Prisma implementation of IUserRepository

import { PrismaClient } from '@prisma/client';
import { IUserRepository, DiscoverFilter } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';

function mapPrismaUser(u: any): User {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    password_hash: u.password_hash,
    foto_perfil: u.foto_perfil,
    zona_localidad: u.zona_localidad,
    zona_ciudad: u.zona_ciudad,
    zona_estado: u.zona_estado,
    zona_pais: u.zona_pais,
    rango: u.rango,
    rol: u.rol,
    victorias: u.victorias,
    derrotas: u.derrotas,
    retos_consecutivos: u.retos_consecutivos,
    estado: u.estado,
    created_at: u.created_at,
    updated_at: u.updated_at,
  };
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? mapPrismaUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? mapPrismaUser(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    return user ? mapPrismaUser(user) : null;
  }

  async create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const user = await this.prisma.user.create({ data: data as any });
    return mapPrismaUser(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: data as any,
    });
    return mapPrismaUser(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async discover(
    filter: DiscoverFilter,
  ): Promise<{ users: User[]; total: number }> {
    const { rango, tipo_vehiculo, excludeUserId, zona_ciudad, zona_pais, page = 1, limit = 10 } = filter;

    const where: any = {
      id: { not: excludeUserId },
      rango,
      estado: 'activo',
      vehicles: {
        some: {
          tipo_vehiculo,
          activo: true,
        },
      },
    };

    if (zona_ciudad) where.zona_ciudad = zona_ciudad;
    if (zona_pais) where.zona_pais = zona_pais;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { victorias: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users: users.map(mapPrismaUser), total };
  }
}
