// Use Case: Get challenge history for a user

import { IChallengeRepository, ChallengeHistoryFilter } from '../../../domain/repositories/IChallengeRepository';
import { Challenge, EstadoChallenge } from '../../../domain/entities/Challenge';

export interface HistoryInput {
  userId: string;
  rol?: 'retador' | 'retado' | 'all';
  estado?: EstadoChallenge;
  page?: number;
  limit?: number;
}

export interface HistoryOutput {
  challenges: Challenge[];
  total: number;
  page: number;
  limit: number;
}

export class GetChallengeHistoryUseCase {
  constructor(private readonly challengeRepo: IChallengeRepository) {}

  async execute(input: HistoryInput): Promise<HistoryOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 10;

    const result = await this.challengeRepo.findHistory({
      userId: input.userId,
      rol: input.rol ?? 'all',
      estado: input.estado,
      page,
      limit,
    });

    return { ...result, page, limit };
  }
}
