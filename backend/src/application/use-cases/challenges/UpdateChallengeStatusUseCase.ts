// Use Case: Accept or reject a challenge (retado only)

import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IChallengeRepository } from '../../../domain/repositories/IChallengeRepository';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { IRealtimeService } from '../../ports/IRealtimeService';
import { Challenge, EstadoChallenge, isValidTransition } from '../../../domain/entities/Challenge';

export interface UpdateStatusInput {
  challengeId: string;
  requestingUserId: string;
  newState: 'aceptado' | 'rechazado' | 'cancelado' | 'en_curso';
}

export class UpdateChallengeStatusUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly challengeRepo: IChallengeRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly realtimeService: IRealtimeService,
  ) {}

  async execute(input: UpdateStatusInput): Promise<Challenge> {
    const { challengeId, requestingUserId, newState } = input;

    const challenge = await this.challengeRepo.findById(challengeId);
    if (!challenge) throw new Error('CHALLENGE_NOT_FOUND');

    // Authorization checks
    const isRetado = challenge.retado_id === requestingUserId;
    const isRetador = challenge.retador_id === requestingUserId;

    if (newState === 'aceptado' || newState === 'rechazado') {
      if (!isRetado) throw new Error('FORBIDDEN');
    }

    if (newState === 'cancelado') {
      if (!isRetador && !isRetado) throw new Error('FORBIDDEN');
      // Only retador can cancel 'pendiente'; either can cancel once accepted
      if (challenge.estado === 'pendiente' && !isRetador) throw new Error('FORBIDDEN');
    }

    if (newState === 'en_curso') {
      if (!isRetador && !isRetado) throw new Error('FORBIDDEN');
    }

    // State machine validation
    if (!isValidTransition(challenge.estado, newState)) {
      throw new Error(`INVALID_TRANSITION:${challenge.estado}->${newState}`);
    }

    const updated = await this.challengeRepo.update(challengeId, { estado: newState });

    // Notifications & real-time events
    const retador = await this.userRepo.findById(challenge.retador_id);
    const retado = await this.userRepo.findById(challenge.retado_id);

    if (newState === 'aceptado' && retador) {
      const notif = await this.notificationRepo.create({
        user_id: challenge.retador_id,
        tipo: 'reto_aceptado',
        mensaje: `@${retado?.username ?? 'tu rival'} aceptó tu reto!`,
        leida: false,
        referencia_id: challenge.id,
      });
      this.realtimeService.emitToUser(challenge.retador_id, 'challenge:accepted', { challenge: updated });
      this.realtimeService.emitToUser(challenge.retador_id, 'notification:new', notif);
    }

    if (newState === 'rechazado' && retador) {
      const notif = await this.notificationRepo.create({
        user_id: challenge.retador_id,
        tipo: 'reto_rechazado',
        mensaje: `@${retado?.username ?? 'tu rival'} rechazó tu reto.`,
        leida: false,
        referencia_id: challenge.id,
      });
      this.realtimeService.emitToUser(challenge.retador_id, 'challenge:rejected', { challenge: updated });
      this.realtimeService.emitToUser(challenge.retador_id, 'notification:new', notif);
    }

    return updated;
  }
}
