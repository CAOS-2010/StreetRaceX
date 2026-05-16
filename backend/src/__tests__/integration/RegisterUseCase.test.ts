import { RegisterUseCase } from '../../application/use-cases/auth/RegisterUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHashService } from '../../application/ports/IHashService';
import { IJwtService } from '../../application/ports/IJwtService';
import { User } from '../../domain/entities/User';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-abc',
    username: 'SpeedKing',
    email: 'speed@king.com',
    password_hash: 'hashed',
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

function makeRepos() {
  const userRepo: jest.Mocked<IUserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    discover: jest.fn(),
  };

  const hashService: jest.Mocked<IHashService> = {
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn(),
  };

  const jwtService: jest.Mocked<IJwtService> = {
    sign: jest.fn().mockReturnValue('jwt.token.here'),
    verify: jest.fn(),
  };

  return { userRepo, hashService, jwtService };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('RegisterUseCase', () => {
  it('creates a user and returns token when email and username are free', async () => {
    const { userRepo, hashService, jwtService } = makeRepos();
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.findByUsername.mockResolvedValue(null);
    const created = makeUser();
    userRepo.create.mockResolvedValue(created);

    const useCase = new RegisterUseCase(userRepo, hashService, jwtService);
    const output = await useCase.execute({
      username: 'SpeedKing',
      email: 'speed@king.com',
      password: 'secret123',
    });

    expect(output.token).toBe('jwt.token.here');
    expect(output.user.username).toBe('SpeedKing');
    expect(output.user).not.toHaveProperty('password_hash');
  });

  it('hashes password before creating user', async () => {
    const { userRepo, hashService, jwtService } = makeRepos();
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.findByUsername.mockResolvedValue(null);
    userRepo.create.mockResolvedValue(makeUser());

    const useCase = new RegisterUseCase(userRepo, hashService, jwtService);
    await useCase.execute({ username: 'SpeedKing', email: 'speed@king.com', password: 'secret123' });

    expect(hashService.hash).toHaveBeenCalledWith('secret123');
    expect(userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ password_hash: 'hashed_password' }),
    );
  });

  it('creates user at Rango D', async () => {
    const { userRepo, hashService, jwtService } = makeRepos();
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.findByUsername.mockResolvedValue(null);
    userRepo.create.mockResolvedValue(makeUser());

    const useCase = new RegisterUseCase(userRepo, hashService, jwtService);
    await useCase.execute({ username: 'SpeedKing', email: 'speed@king.com', password: 'pass' });

    expect(userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ rango: 'D', victorias: 0, derrotas: 0, retos_consecutivos: 0 }),
    );
  });

  it('throws EMAIL_TAKEN when email already exists', async () => {
    const { userRepo, hashService, jwtService } = makeRepos();
    userRepo.findByEmail.mockResolvedValue(makeUser());

    const useCase = new RegisterUseCase(userRepo, hashService, jwtService);
    await expect(
      useCase.execute({ username: 'Other', email: 'speed@king.com', password: 'pass' }),
    ).rejects.toThrow('EMAIL_TAKEN');
  });

  it('throws USERNAME_TAKEN when username already exists', async () => {
    const { userRepo, hashService, jwtService } = makeRepos();
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.findByUsername.mockResolvedValue(makeUser());

    const useCase = new RegisterUseCase(userRepo, hashService, jwtService);
    await expect(
      useCase.execute({ username: 'SpeedKing', email: 'new@email.com', password: 'pass' }),
    ).rejects.toThrow('USERNAME_TAKEN');
  });

  it('does not call hashService or userRepo.create when validation fails', async () => {
    const { userRepo, hashService, jwtService } = makeRepos();
    userRepo.findByEmail.mockResolvedValue(makeUser());

    const useCase = new RegisterUseCase(userRepo, hashService, jwtService);
    await expect(
      useCase.execute({ username: 'X', email: 'taken@x.com', password: 'pass' }),
    ).rejects.toThrow();

    expect(hashService.hash).not.toHaveBeenCalled();
    expect(userRepo.create).not.toHaveBeenCalled();
  });
});
