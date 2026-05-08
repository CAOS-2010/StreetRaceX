// Use Case: Mark a notification as read

import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { Notification } from '../../../domain/entities/Notification';

export class MarkNotificationReadUseCase {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  async execute(notificationId: string, userId: string): Promise<Notification> {
    return this.notificationRepo.markAsRead(notificationId, userId);
  }

  async markAll(userId: string): Promise<void> {
    return this.notificationRepo.markAllAsRead(userId);
  }
}
