// Infrastructure: Prisma implementation of IChallengeRepository

import { PrismaClient } from '@prisma/client';
import {
  IChallengeRepository,
  ChallengeHistoryFilter,
} from '../../../domain/repositories/IChallengeRepository';
import { Challenge, ACTIVE_CHALLENGE_STATES } from '../../../domain/entities/Challenge';

function mapPrismaChallenge(c: any): Challenge {
  return {
    id: c.id,
    retador_id: c.retador_id,
    retado_id: c.retado_id,
    vehiculo_retador_id: c.vehiculo_retador_id,
    vehiculo_retado_id: c.vehiculo_retado_id,
    tipo_carrera: c.tipo_carrera,
    estado: c.estado,
    ganador_id: c.ganador_id,
    ubicacion_acordada: c.ubicacion_acordada,
    fecha_acordada: c.fecha_acordada,
    notas: c.notas,
    created_at: c.created_at,
    updated_at: c.updated_at,
  };
}

export class PrismaChallengeRepository implements IChallengeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Challenge | null> {
    const c = await this.prisma.challenge.findUnique({ where: { id } });
    return c ? mapPrismaChallenge(c) : null;
  }

  async create(
    data: Omit<Challenge, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Challenge> {
    const c = await this.prisma.challenge.create({ data: data as any });
    return mapPrismaChallenge(c);
  }

  async update(id: string, data: Partial<Challenge>): Promise<Challenge> {
    const c = await this.prisma.challenge.update({
      where: { id },
      data: data as any,
    });
    return mapPrismaChallenge(c);
  }

  async findActiveChallengeBetweenUsers(
    userAId: string,
    userBId: string,
  ): Promise<Challenge | null> {
    const c = await this.prisma.challenge.findFirst({
      where: {
        estado: { in: ACTIVE_CHALLENGE_STATES as any[] },
        OR: [
          { retador_id: userAId, retado_id: userBId },
          { retador_id: userBId, retado_id: userAId },
        ],
      },
    });
    return c ? mapPrismaChallenge(c) : null;
  }

  async findHistory(
    filter: ChallengeHistoryFilter,
  ): Promise<{ challenges: Challenge[]; total: number }> {
    const { userId, rol = 'all', estado, page = 1, limit = 10 } = filter;

    const where: any = {};

    if (rol === 'retador') {
      where.retador_id = userId;
    } else if (rol === 'retado') {
      where.retado_id = userId;
    } else {
      where.OR = [{ retador_id: userId }, { retado_id: userId }];
    }

    if (estado) where.estado = estado;

    const [challenges, total] = await Promise.all([
      this.prisma.challenge.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.challenge.count({ where }),
    ]);

    return { challenges: challenges.map(mapPrismaChallenge), total };
  }
}
