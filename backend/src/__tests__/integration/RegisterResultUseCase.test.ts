import { RegisterResultUseCase } from '../../application/use-cases/challenges/RegisterResultUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IChallengeRepository } from '../../domain/repositories/IChallengeRepository';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { IRealtimeService } from '../../application/ports/IRealtimeService';
import { User } from '../../domain/entities/User';
import { Challenge } from '../../domain/entities/Challenge';
import { Notification } from '../../domain/entities/Notification';

// ── Factories ─────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    username: 'SpeedKing',
    email: 'speed@king.com',
    password_hash: 'hash',
    rango: 'D',
    rol: 'piloto',
    victorias: 0,
    derrotas: 0,
    retos_consecutivos: 0,
    estado: 'activo',
    created_at: new Date(),
    updated_at: new Date(),
    foto_perfil: null,
    zona_localidad: null,
    zona_ciudad: null,
    zona_estado: null,
    zona_pais: null,
    ...overrides,
  };
}

function makeChallenge(overrides: Partial<Challenge> = {}): Challenge {
  return {
    id: 'challenge-1',
    retador_id: 'user-1',
    retado_id: 'user-2',
    vehiculo_retador_id: 'vehicle-1',
    vehiculo_retado_id: 'vehicle-2',
    tipo_carrera: 'cuarto_milla',
    estado: 'en_curso',
    ganador_id: null,
    ubicacion_acordada: null,
    fecha_acordada: null,
    notas: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

function makeNotif(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'notif-1',
    user_id: 'user-1',
    tipo: 'resultado',
    mensaje: 'Msg',
    leida: false,
    referencia_id: 'challenge-1',
    created_at: new Date(),
    ...overrides,
  };
}

function makeDeps() {
  const userRepo: jest.Mocked<IUserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
    update: jest.fn().mockResolvedValue(makeUser()),
    delete: jest.fn(),
    discover: jest.fn(),
  };

  const challengeRepo: jest.Mocked<IChallengeRepository> = {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn().mockResolvedValue(makeChallenge({ estado: 'completado', ganador_id: 'user-1' })),
    findActiveChallengeBetweenUsers: jest.fn(),
    findHistory: jest.fn(),
  };

  const notificationRepo: jest.Mocked<INotificationRepository> = {
    findByUserId: jest.fn(),
    create: jest.fn().mockResolvedValue(makeNotif()),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  const realtimeService: jest.Mocked<IRealtimeService> = {
    emitToUser: jest.fn(),
  };

  return { userRepo, challengeRepo, notificationRepo, realtimeService };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('RegisterResultUseCase', () => {
  it('marks challenge as completado and returns winnerRankUpgraded=false on first win', async () => {
    const deps = makeDeps();
    deps.challengeRepo.findById.mockResolvedValue(makeChallenge({ estado: 'en_curso' }));
    deps.userRepo.findById
      .mockResolvedValueOnce(makeUser({ id: 'user-1', retos_consecutivos: 0 })) // winner
      .mockResolvedValueOnce(makeUser({ id: 'user-2', retos_consecutivos: 0 })); // loser

    const useCase = new RegisterResultUseCase(
      deps.userRepo, deps.challengeRepo, deps.notificationRepo, deps.realtimeService,
    );

    const output = await useCase.execute({
      challengeId: 'challenge-1',
      requestingUserId: 'user-1',
      ganadorId: 'user-1',
    });

    expect(output.winnerRankUpgraded).toBe(false);
    expect(deps.challengeRepo.update).toHaveBeenCalledWith(
      'challenge-1',
      expect.objectContaining({ estado: 'completado', ganador_id: 'user-1' }),
    );
  });

  it('upgrades winner rank when they reach 2 consecutive wins', async () => {
    const deps = makeDeps();
    deps.challengeRepo.findById.mockResolvedValue(makeChallenge({ estado: 'en_curso' }));
    // winner already has 1 consecutive win — second win should trigger rank up
    deps.userRepo.findById
      .mockResolvedValueOnce(makeUser({ id: 'user-1', rango: 'D', retos_consecutivos: 1 }))
      .mockResolvedValueOnce(makeUser({ id: 'user-2', retos_consecutivos: 0 }));

    const useCase = new RegisterResultUseCase(
      deps.userRepo, deps.challengeRepo, deps.notificationRepo, deps.realtimeService,
    );

    const output = await useCase.execute({
      challengeId: 'challenge-1',
      requestingUserId: 'user-1',
      ganadorId: 'user-1',
    });

    expect(output.winnerRankUpgraded).toBe(true);
    // Should emit rank:upgraded
    expect(deps.realtimeService.emitToUser).toHaveBeenCalledWith(
      'user-1',
      'rank:upgraded',
      expect.objectContaining({ oldRank: 'D', newRank: 'C' }),
    );
  });

  it('throws CHALLENGE_NOT_FOUND when challenge does not exist', async () => {
    const deps = makeDeps();
    deps.challengeRepo.findById.mockResolvedValue(null);

    const useCase = new RegisterResultUseCase(
      deps.userRepo, deps.challengeRepo, deps.notificationRepo, deps.realtimeService,
    );

    await expect(
      useCase.execute({ challengeId: 'bad-id', requestingUserId: 'user-1', ganadorId: 'user-1' }),
    ).rejects.toThrow('CHALLENGE_NOT_FOUND');
  });

  it('throws FORBIDDEN when requestingUser is not a participant', async () => {
    const deps = makeDeps();
    deps.challengeRepo.findById.mockResolvedValue(
      makeChallenge({ retador_id: 'user-1', retado_id: 'user-2', estado: 'en_curso' }),
    );

    const useCase = new RegisterResultUseCase(
      deps.userRepo, deps.challengeRepo, deps.notificationRepo, deps.realtimeService,
    );

    await expect(
      useCase.execute({ challengeId: 'challenge-1', requestingUserId: 'outsider', ganadorId: 'user-1' }),
    ).rejects.toThrow('FORBIDDEN');
  });

  it('throws CHALLENGE_NOT_ACTIVE when challenge is still pendiente', async () => {
    const deps = makeDeps();
    deps.challengeRepo.findById.mockResolvedValue(makeChallenge({ estado: 'pendiente' }));

    const useCase = new RegisterResultUseCase(
      deps.userRepo, deps.challengeRepo, deps.notificationRepo, deps.realtimeService,
    );

    await expect(
      useCase.execute({ challengeId: 'challenge-1', requestingUserId: 'user-1', ganadorId: 'user-1' }),
    ).rejects.toThrow('CHALLENGE_NOT_ACTIVE');
  });

  it('throws CHALLENGE_NOT_ACTIVE when challenge is already completado', async () => {
    const deps = makeDeps();
    deps.challengeRepo.findById.mockResolvedValue(makeChallenge({ estado: 'completado' }));

    const useCase = new RegisterResultUseCase(
      deps.userRepo, deps.challengeRepo, deps.notificationRepo, deps.realtimeService,
    );

    await expect(
      useCase.execute({ challengeId: 'challenge-1', requestingUserId: 'user-1', ganadorId: 'user-1' }),
    ).rejects.toThrow('CHALLENGE_NOT_ACTIVE');
  });

  it('throws INVALID_WINNER when ganadorId is not a participant', async () => {
    const deps = makeDeps();
    deps.challengeRepo.findById.mockResolvedValue(
      makeChallenge({ retador_id: 'user-1', retado_id: 'user-2', estado: 'aceptado' }),
    );

    const useCase = new RegisterResultUseCase(
      deps.userRepo, deps.challengeRepo, deps.notificationRepo, deps.realtimeService,
    );

    await expect(
      useCase.execute({ challengeId: 'challenge-1', requestingUserId: 'user-1', ganadorId: 'outsider' }),
    ).rejects.toThrow('INVALID_WINNER');
  });

  it('notifies both winner and loser', async () => {
    const deps = makeDeps();
    deps.challengeRepo.findById.mockResolvedValue(makeChallenge({ estado: 'aceptado' }));
    deps.userRepo.findById
      .mockResolvedValueOnce(makeUser({ id: 'user-1', username: 'SpeedKing' }))
      .mockResolvedValueOnce(makeUser({ id: 'user-2', username: 'NightDrifter' }));

    const useCase = new RegisterResultUseCase(
      deps.userRepo, deps.challengeRepo, deps.notificationRepo, deps.realtimeService,
    );

    await useCase.execute({ challengeId: 'challenge-1', requestingUserId: 'user-1', ganadorId: 'user-1' });

    // notification:new emitted to both participants
    const calls = (deps.realtimeService.emitToUser as jest.Mock).mock.calls;
    const notifReceivers = calls
      .filter(([, evt]) => evt === 'notification:new')
      .map(([uid]) => uid);

    expect(notifReceivers).toContain('user-1');
    expect(notifReceivers).toContain('user-2');
  });
});
