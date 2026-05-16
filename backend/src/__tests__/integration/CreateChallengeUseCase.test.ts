import { CreateChallengeUseCase } from '../../application/use-cases/challenges/CreateChallengeUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IVehicleRepository } from '../../domain/repositories/IVehicleRepository';
import { IChallengeRepository } from '../../domain/repositories/IChallengeRepository';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { IRealtimeService } from '../../application/ports/IRealtimeService';
import { User } from '../../domain/entities/User';
import { Vehicle } from '../../domain/entities/Vehicle';
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

function makeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'vehicle-1',
    user_id: 'user-1',
    tipo_vehiculo: 'auto',
    marca: 'Honda',
    modelo: 'Civic',
    anio: 2020,
    activo: true,
    created_at: new Date(),
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
    estado: 'pendiente',
    ganador_id: null,
    ubicacion_acordada: null,
    fecha_acordada: null,
    notas: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'notif-1',
    user_id: 'user-2',
    tipo: 'reto_recibido',
    mensaje: 'Tienes un reto!',
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
    update: jest.fn(),
    delete: jest.fn(),
    discover: jest.fn(),
  };

  const vehicleRepo: jest.Mocked<IVehicleRepository> = {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findActiveByUserId: jest.fn(),
    countByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deactivateAllForUser: jest.fn(),
  };

  const challengeRepo: jest.Mocked<IChallengeRepository> = {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findActiveChallengeBetweenUsers: jest.fn(),
    findHistory: jest.fn(),
  };

  const notificationRepo: jest.Mocked<INotificationRepository> = {
    findByUserId: jest.fn(),
    create: jest.fn().mockResolvedValue(makeNotification()),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  const realtimeService: jest.Mocked<IRealtimeService> = {
    emitToUser: jest.fn(),
  };

  return { userRepo, vehicleRepo, challengeRepo, notificationRepo, realtimeService };
}

// ── Happy path setup helper ───────────────────────────────────────────────────

function setupHappyPath(deps: ReturnType<typeof makeDeps>) {
  const retador = makeUser({ id: 'user-1', rango: 'D' });
  const retado = makeUser({ id: 'user-2', username: 'NightDrifter', rango: 'D' });
  const vRetador = makeVehicle({ id: 'vehicle-1', user_id: 'user-1', tipo_vehiculo: 'auto' });
  const vRetado = makeVehicle({ id: 'vehicle-2', user_id: 'user-2', tipo_vehiculo: 'auto' });
  const challenge = makeChallenge();

  deps.userRepo.findById
    .mockResolvedValueOnce(retador)
    .mockResolvedValueOnce(retado);
  deps.vehicleRepo.findActiveByUserId
    .mockResolvedValueOnce(vRetador)
    .mockResolvedValueOnce(vRetado);
  deps.challengeRepo.findActiveChallengeBetweenUsers.mockResolvedValue(null);
  deps.challengeRepo.create.mockResolvedValue(challenge);

  return { retador, retado, challenge };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CreateChallengeUseCase', () => {
  it('creates a challenge between two valid pilots', async () => {
    const deps = makeDeps();
    setupHappyPath(deps);
    const useCase = new CreateChallengeUseCase(
      deps.userRepo, deps.vehicleRepo, deps.challengeRepo,
      deps.notificationRepo, deps.realtimeService,
    );

    const result = await useCase.execute({
      retadorId: 'user-1',
      retadoId: 'user-2',
      tipo_carrera: 'cuarto_milla',
    });

    expect(result.estado).toBe('pendiente');
    expect(deps.challengeRepo.create).toHaveBeenCalledTimes(1);
  });

  it('emits challenge:received and notification:new to retado', async () => {
    const deps = makeDeps();
    setupHappyPath(deps);
    const useCase = new CreateChallengeUseCase(
      deps.userRepo, deps.vehicleRepo, deps.challengeRepo,
      deps.notificationRepo, deps.realtimeService,
    );

    await useCase.execute({ retadorId: 'user-1', retadoId: 'user-2', tipo_carrera: 'cuarto_milla' });

    expect(deps.realtimeService.emitToUser).toHaveBeenCalledWith('user-2', 'challenge:received', expect.anything());
    expect(deps.realtimeService.emitToUser).toHaveBeenCalledWith('user-2', 'notification:new', expect.anything());
  });

  it('throws SELF_CHALLENGE_NOT_ALLOWED when retador challenges himself', async () => {
    const deps = makeDeps();
    const useCase = new CreateChallengeUseCase(
      deps.userRepo, deps.vehicleRepo, deps.challengeRepo,
      deps.notificationRepo, deps.realtimeService,
    );

    await expect(
      useCase.execute({ retadorId: 'user-1', retadoId: 'user-1', tipo_carrera: 'cuarto_milla' }),
    ).rejects.toThrow('SELF_CHALLENGE_NOT_ALLOWED');
  });

  it('throws RETADOR_NO_ACTIVE_VEHICLE when retador has no vehicle', async () => {
    const deps = makeDeps();
    deps.userRepo.findById
      .mockResolvedValueOnce(makeUser({ id: 'user-1' }))
      .mockResolvedValueOnce(makeUser({ id: 'user-2' }));
    deps.vehicleRepo.findActiveByUserId.mockResolvedValue(null);

    const useCase = new CreateChallengeUseCase(
      deps.userRepo, deps.vehicleRepo, deps.challengeRepo,
      deps.notificationRepo, deps.realtimeService,
    );

    await expect(
      useCase.execute({ retadorId: 'user-1', retadoId: 'user-2', tipo_carrera: 'vueltas' }),
    ).rejects.toThrow('RETADOR_NO_ACTIVE_VEHICLE');
  });

  it('throws RETADO_NO_ACTIVE_VEHICLE when retado has no vehicle', async () => {
    const deps = makeDeps();
    deps.userRepo.findById
      .mockResolvedValueOnce(makeUser({ id: 'user-1' }))
      .mockResolvedValueOnce(makeUser({ id: 'user-2' }));
    deps.vehicleRepo.findActiveByUserId
      .mockResolvedValueOnce(makeVehicle({ id: 'v1', user_id: 'user-1' }))
      .mockResolvedValueOnce(null);

    const useCase = new CreateChallengeUseCase(
      deps.userRepo, deps.vehicleRepo, deps.challengeRepo,
      deps.notificationRepo, deps.realtimeService,
    );

    await expect(
      useCase.execute({ retadorId: 'user-1', retadoId: 'user-2', tipo_carrera: 'vueltas' }),
    ).rejects.toThrow('RETADO_NO_ACTIVE_VEHICLE');
  });

  it('throws RANK_MISMATCH when pilots have different ranks', async () => {
    const deps = makeDeps();
    deps.userRepo.findById
      .mockResolvedValueOnce(makeUser({ id: 'user-1', rango: 'D' }))
      .mockResolvedValueOnce(makeUser({ id: 'user-2', rango: 'A' }));
    deps.vehicleRepo.findActiveByUserId
      .mockResolvedValueOnce(makeVehicle({ user_id: 'user-1' }))
      .mockResolvedValueOnce(makeVehicle({ user_id: 'user-2' }));

    const useCase = new CreateChallengeUseCase(
      deps.userRepo, deps.vehicleRepo, deps.challengeRepo,
      deps.notificationRepo, deps.realtimeService,
    );

    await expect(
      useCase.execute({ retadorId: 'user-1', retadoId: 'user-2', tipo_carrera: 'derrape' }),
    ).rejects.toThrow('RANK_MISMATCH');
  });

  it('throws VEHICLE_TYPE_MISMATCH when vehicles are different types', async () => {
    const deps = makeDeps();
    deps.userRepo.findById
      .mockResolvedValueOnce(makeUser({ id: 'user-1', rango: 'B' }))
      .mockResolvedValueOnce(makeUser({ id: 'user-2', rango: 'B' }));
    deps.vehicleRepo.findActiveByUserId
      .mockResolvedValueOnce(makeVehicle({ user_id: 'user-1', tipo_vehiculo: 'auto' }))
      .mockResolvedValueOnce(makeVehicle({ user_id: 'user-2', tipo_vehiculo: 'moto' }));

    const useCase = new CreateChallengeUseCase(
      deps.userRepo, deps.vehicleRepo, deps.challengeRepo,
      deps.notificationRepo, deps.realtimeService,
    );

    await expect(
      useCase.execute({ retadorId: 'user-1', retadoId: 'user-2', tipo_carrera: 'cuarto_milla' }),
    ).rejects.toThrow('VEHICLE_TYPE_MISMATCH');
  });

  it('throws ACTIVE_CHALLENGE_EXISTS when there is an ongoing challenge', async () => {
    const deps = makeDeps();
    deps.userRepo.findById
      .mockResolvedValueOnce(makeUser({ id: 'user-1', rango: 'C' }))
      .mockResolvedValueOnce(makeUser({ id: 'user-2', rango: 'C' }));
    deps.vehicleRepo.findActiveByUserId
      .mockResolvedValueOnce(makeVehicle({ user_id: 'user-1' }))
      .mockResolvedValueOnce(makeVehicle({ user_id: 'user-2' }));
    deps.challengeRepo.findActiveChallengeBetweenUsers.mockResolvedValue(makeChallenge());

    const useCase = new CreateChallengeUseCase(
      deps.userRepo, deps.vehicleRepo, deps.challengeRepo,
      deps.notificationRepo, deps.realtimeService,
    );

    await expect(
      useCase.execute({ retadorId: 'user-1', retadoId: 'user-2', tipo_carrera: 'vueltas' }),
    ).rejects.toThrow('ACTIVE_CHALLENGE_EXISTS');
  });
});
