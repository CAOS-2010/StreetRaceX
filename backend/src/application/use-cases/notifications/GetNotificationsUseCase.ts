// Use Case: Get notifications for a user

import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { Notification } from '../../../domain/entities/Notification';

export interface GetNotificationsOutput {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

export class GetNotificationsUseCase {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  async execute(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<GetNotificationsOutput> {
    const result = await this.notificationRepo.findByUserId(userId, page, limit);
    return { ...result, page, limit };
  }
}
