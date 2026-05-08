// Port: Challenge Repository Interface

import { Challenge, EstadoChallenge } from '../entities/Challenge';

export interface ChallengeHistoryFilter {
  userId: string;
  rol?: 'retador' | 'retado' | 'all';
  estado?: EstadoChallenge;
  page?: number;
  limit?: number;
}

export interface IChallengeRepository {
  findById(id: string): Promise<Challenge | null>;
  create(data: Omit<Challenge, 'id' | 'created_at' | 'updated_at'>): Promise<Challenge>;
  update(id: string, data: Partial<Challenge>): Promise<Challenge>;
  findActiveChallengeBetweenUsers(
    userAId: string,
    userBId: string,
  ): Promise<Challenge | null>;
  findHistory(
    filter: ChallengeHistoryFilter,
  ): Promise<{ challenges: Challenge[]; total: number }>;
}
