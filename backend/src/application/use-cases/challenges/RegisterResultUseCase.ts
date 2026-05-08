// Use Case: Register the result of a completed challenge
// Updates winner stats, loser stats, applies rank logic

import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IChallengeRepository } from '../../../domain/repositories/IChallengeRepository';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { IRealtimeService } from '../../ports/IRealtimeService';
import { RankService } from '../../../domain/services/RankService';
import { Challenge } from '../../../domain/entities/Challenge';

export interface RegisterResultInput {
  challengeId: string;
  requestingUserId: string;
  ganadorId: string;
}

export interface RegisterResultOutput {
  challenge: Challenge;
  winnerRankUpgraded: boolean;
}

export class RegisterResultUseCase {
  private readonly rankService = new RankService();

  constructor(
    private readonly userRepo: IUserRepository,
    private readonly challengeRepo: IChallengeRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly realtimeService: IRealtimeService,
  ) {}

  async execute(input: RegisterResultInput): Promise<RegisterResultOutput> {
    const { challengeId, requestingUserId, ganadorId } = input;

    const challenge = await this.challengeRepo.findById(challengeId);
    if (!challenge) throw new Error('CHALLENGE_NOT_FOUND');

    // Only participants can register result
    const isParticipant =
      challenge.retador_id === requestingUserId ||
      challenge.retado_id === requestingUserId;
    if (!isParticipant) throw new Error('FORBIDDEN');

    // Challenge must be accepted or en_curso to register result
    if (challenge.estado !== 'aceptado' && challenge.estado !== 'en_curso') {
      throw new Error('CHALLENGE_NOT_ACTIVE');
    }

    // Winner must be one of the participants
    if (ganadorId !== challenge.retador_id && ganadorId !== challenge.retado_id) {
      throw new Error('INVALID_WINNER');
    }

    const perdedorId =
      ganadorId === challenge.retador_id ? challenge.retado_id : challenge.retador_id;

    // Load both users
    const [winner, loser] = await Promise.all([
      this.userRepo.findById(ganadorId),
      this.userRepo.findById(perdedorId),
    ]);
    if (!winner || !loser) throw new Error('USER_NOT_FOUND');

    // Apply rank logic
    const winResult = this.rankService.applyWin(winner);
    const lossResult = this.rankService.applyLoss(loser);

    // Update challenge
    const updatedChallenge = await this.challengeRepo.update(challengeId, {
      estado: 'completado',
      ganador_id: ganadorId,
    });

    // Update winner stats
    await this.userRepo.update(ganadorId, {
      victorias: winner.victorias + 1,
      rango: winResult.newRango,
      retos_consecutivos: winResult.newRetosConsecutivos,
    });

    // Update loser stats
    await this.userRepo.update(perdedorId, {
      derrotas: loser.derrotas + 1,
      retos_consecutivos: lossResult.newRetosConsecutivos,
    });

    // Notify both
    const [winnerNotif, loserNotif] = await Promise.all([
      this.notificationRepo.create({
        user_id: ganadorId,
        tipo: 'resultado',
        mensaje: `Ganaste el reto contra @${loser.username}!`,
        leida: false,
        referencia_id: challengeId,
      }),
      this.notificationRepo.create({
        user_id: perdedorId,
        tipo: 'resultado',
        mensaje: `Perdiste el reto contra @${winner.username}.`,
        leida: false,
        referencia_id: challengeId,
      }),
    ]);

    // Emit challenge:completed to both participants
    this.realtimeService.emitToUser(ganadorId, 'challenge:completed', {
      challenge: updatedChallenge,
      resultado: 'victoria',
    });
    this.realtimeService.emitToUser(ganadorId, 'notification:new', winnerNotif);

    this.realtimeService.emitToUser(perdedorId, 'challenge:completed', {
      challenge: updatedChallenge,
      resultado: 'derrota',
    });
    this.realtimeService.emitToUser(perdedorId, 'notification:new', loserNotif);

    // Emit rank upgrade event if winner leveled up
    if (winResult.rankUpgraded) {
      const rankNotif = await this.notificationRepo.create({
        user_id: ganadorId,
        tipo: 'rango_subido',
        mensaje: `Felicidades! Ascendiste al rango ${winResult.newRango}!`,
        leida: false,
        referencia_id: null,
      });
      this.realtimeService.emitToUser(ganadorId, 'rank:upgraded', {
        oldRank: winner.rango,
        newRank: winResult.newRango,
      });
      this.realtimeService.emitToUser(ganadorId, 'notification:new', rankNotif);
    }

    return {
      challenge: updatedChallenge,
      winnerRankUpgraded: winResult.rankUpgraded,
    };
  }
}
