// Controller: Users

import { Request, Response, NextFunction } from 'express';
import { GetProfileUseCase } from '../../../application/use-cases/users/GetProfileUseCase';
import { DiscoverUsersUseCase } from '../../../application/use-cases/users/DiscoverUsersUseCase';
import { UpdateProfileUseCase } from '../../../application/use-cases/users/UpdateProfileUseCase';

export class UserController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly discoverUsersUseCase: DiscoverUsersUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getProfileUseCase.execute(req.userId!);
      res.status(200).json({ success: true, data: result, message: 'Profile retrieved' });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getProfileUseCase.execute(req.params.id);
      res.status(200).json({ success: true, data: result, message: 'Profile retrieved' });
    } catch (err) {
      next(err);
    }
  };

  updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.updateProfileUseCase.execute({
        userId: req.userId!,
        ...req.body,
      });
      res.status(200).json({ success: true, data: result, message: 'Profile updated' });
    } catch (err) {
      next(err);
    }
  };

  discover = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { zona_ciudad, zona_pais, page, limit } = req.query as Record<string, string | undefined>;
      const result = await this.discoverUsersUseCase.execute({
        requestingUserId: req.userId!,
        zona_ciudad,
        zona_pais,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      });
      res.status(200).json({ success: true, data: result, message: 'Pilots discovered' });
    } catch (err) {
      next(err);
    }
  };
}
