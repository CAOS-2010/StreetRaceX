// Controller: Challenges

import { Request, Response, NextFunction } from 'express';
import { CreateChallengeUseCase } from '../../../application/use-cases/challenges/CreateChallengeUseCase';
import { UpdateChallengeStatusUseCase } from '../../../application/use-cases/challenges/UpdateChallengeStatusUseCase';
import { RegisterResultUseCase } from '../../../application/use-cases/challenges/RegisterResultUseCase';
import { GetChallengeHistoryUseCase } from '../../../application/use-cases/challenges/GetChallengeHistoryUseCase';
import { EstadoChallenge } from '../../../domain/entities/Challenge';

export class ChallengeController {
  constructor(
    private readonly createChallengeUseCase: CreateChallengeUseCase,
    private readonly updateStatusUseCase: UpdateChallengeStatusUseCase,
    private readonly registerResultUseCase: RegisterResultUseCase,
    private readonly getHistoryUseCase: GetChallengeHistoryUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { retado_id, tipo_carrera, ubicacion_acordada, fecha_acordada, notas } = req.body;
      const challenge = await this.createChallengeUseCase.execute({
        retadorId: req.userId!,
        retadoId: retado_id,
        tipo_carrera,
        ubicacion_acordada,
        fecha_acordada: fecha_acordada ? new Date(fecha_acordada) : undefined,
        notas,
      });
      res.status(201).json({ success: true, data: challenge, message: 'Challenge sent' });
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const challenge = await this.updateStatusUseCase.execute({
        challengeId: req.params.id,
        requestingUserId: req.userId!,
        newState: req.body.estado,
      });
      res.status(200).json({ success: true, data: challenge, message: 'Challenge status updated' });
    } catch (err) {
      next(err);
    }
  };

  registerResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.registerResultUseCase.execute({
        challengeId: req.params.id,
        requestingUserId: req.userId!,
        ganadorId: req.body.ganador_id,
      });
      res.status(200).json({ success: true, data: result, message: 'Result registered' });
    } catch (err) {
      next(err);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { rol, estado, page, limit } = req.query as Record<string, string | undefined>;
      const result = await this.getHistoryUseCase.execute({
        userId: req.userId!,
        rol: (rol as any) ?? 'all',
        estado: estado as EstadoChallenge | undefined,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      });
      res.status(200).json({ success: true, data: result, message: 'History retrieved' });
    } catch (err) {
      next(err);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const challenge = await this.updateStatusUseCase.execute({
        challengeId: req.params.id,
        requestingUserId: req.userId!,
        newState: 'cancelado',
      });
      res.status(200).json({ success: true, data: challenge, message: 'Challenge cancelled' });
    } catch (err) {
      next(err);
    }
  };
}
