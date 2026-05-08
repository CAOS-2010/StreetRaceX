// Controller: Notifications

import { Request, Response, NextFunction } from 'express';
import { GetNotificationsUseCase } from '../../../application/use-cases/notifications/GetNotificationsUseCase';
import { MarkNotificationReadUseCase } from '../../../application/use-cases/notifications/MarkNotificationReadUseCase';

export class NotificationController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markReadUseCase: MarkNotificationReadUseCase,
  ) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = req.query as Record<string, string | undefined>;
      const result = await this.getNotificationsUseCase.execute(
        req.userId!,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 20,
      );
      res.status(200).json({ success: true, data: result, message: 'Notifications retrieved' });
    } catch (err) {
      next(err);
    }
  };

  markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notification = await this.markReadUseCase.execute(req.params.id, req.userId!);
      res.status(200).json({ success: true, data: notification, message: 'Notification marked as read' });
    } catch (err) {
      next(err);
    }
  };

  markAllRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.markReadUseCase.markAll(req.userId!);
      res.status(200).json({ success: true, data: null, message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  };
}
