// Port: Notification Repository Interface

import { Notification, TipoNotificacion } from '../entities/Notification';

export interface INotificationRepository {
  findByUserId(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<{ notifications: Notification[]; total: number }>;
  create(
    data: Omit<Notification, 'id' | 'created_at'>,
  ): Promise<Notification>;
  markAsRead(id: string, userId: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<void>;
}
