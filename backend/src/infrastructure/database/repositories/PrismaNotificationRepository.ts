// Infrastructure: Prisma implementation of INotificationRepository

import { PrismaClient } from '@prisma/client';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { Notification } from '../../../domain/entities/Notification';

function mapPrismaNotification(n: any): Notification {
  return {
    id: n.id,
    user_id: n.user_id,
    tipo: n.tipo,
    mensaje: n.mensaje,
    leida: n.leida,
    referencia_id: n.referencia_id,
    created_at: n.created_at,
  };
}

export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const where = { user_id: userId };
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { notifications: notifications.map(mapPrismaNotification), total };
  }

  async create(
    data: Omit<Notification, 'id' | 'created_at'>,
  ): Promise<Notification> {
    const n = await this.prisma.notification.create({ data: data as any });
    return mapPrismaNotification(n);
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    // Verify ownership first
    const existing = await this.prisma.notification.findFirst({
      where: { id, user_id: userId },
    });
    if (!existing) throw new Error('NOTIFICATION_NOT_FOUND');

    const n = await this.prisma.notification.update({
      where: { id },
      data: { leida: true },
    });
    return mapPrismaNotification(n);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { user_id: userId, leida: false },
      data: { leida: true },
    });
  }
}
