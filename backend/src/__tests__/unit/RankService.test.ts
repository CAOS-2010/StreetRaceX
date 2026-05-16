import { RankService } from '../../domain/services/RankService';
import { User } from '../../domain/entities/User';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    username: 'TestPilot',
    email: 'test@pilot.com',
    password_hash: 'hash',
    rango: 'D',
    rol: 'piloto',
    victorias: 0,
    derrotas: 0,
    retos_consecutivos: 0,
    estado: 'activo',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

describe('RankService', () => {
  let service: RankService;

  beforeEach(() => {
    service = new RankService();
  });

  // ── applyWin ──────────────────────────────────────────────

  describe('applyWin', () => {
    it('increments streak without ranking up on first win', () => {
      const user = makeUser({ rango: 'D', retos_consecutivos: 0 });
      const result = service.applyWin(user);
      expect(result.newRango).toBe('D');
      expect(result.newRetosConsecutivos).toBe(1);
      expect(result.rankUpgraded).toBe(false);
    });

    it('ranks up D→C on second consecutive win', () => {
      const user = makeUser({ rango: 'D', retos_consecutivos: 1 });
      const result = service.applyWin(user);
      expect(result.newRango).toBe('C');
      expect(result.newRetosConsecutivos).toBe(0);
      expect(result.rankUpgraded).toBe(true);
    });

    it('ranks up C→B on second consecutive win', () => {
      const user = makeUser({ rango: 'C', retos_consecutivos: 1 });
      const result = service.applyWin(user);
      expect(result.newRango).toBe('B');
      expect(result.rankUpgraded).toBe(true);
    });

    it('ranks up B→A on second consecutive win', () => {
      const user = makeUser({ rango: 'B', retos_consecutivos: 1 });
      const result = service.applyWin(user);
      expect(result.newRango).toBe('A');
      expect(result.rankUpgraded).toBe(true);
    });

    it('ranks up A→S on second consecutive win', () => {
      const user = makeUser({ rango: 'A', retos_consecutivos: 1 });
      const result = service.applyWin(user);
      expect(result.newRango).toBe('S');
      expect(result.rankUpgraded).toBe(true);
    });

    it('stays at S and resets streak when already at max rank', () => {
      const user = makeUser({ rango: 'S', retos_consecutivos: 1 });
      const result = service.applyWin(user);
      expect(result.newRango).toBe('S');
      expect(result.newRetosConsecutivos).toBe(0);
      expect(result.rankUpgraded).toBe(false);
    });

    it('resets streak to 0 after ranking up', () => {
      const user = makeUser({ rango: 'D', retos_consecutivos: 1 });
      const result = service.applyWin(user);
      expect(result.newRetosConsecutivos).toBe(0);
    });
  });

  // ── applyLoss ─────────────────────────────────────────────

  describe('applyLoss', () => {
    it('decrements streak from 1 to 0', () => {
      const user = makeUser({ rango: 'B', retos_consecutivos: 1 });
      const result = service.applyLoss(user);
      expect(result.newRetosConsecutivos).toBe(0);
      expect(result.rankUpgraded).toBe(false);
    });

    it('does not allow streak to go below 0', () => {
      const user = makeUser({ rango: 'C', retos_consecutivos: 0 });
      const result = service.applyLoss(user);
      expect(result.newRetosConsecutivos).toBe(0);
    });

    it('never downgrades rank', () => {
      const user = makeUser({ rango: 'A', retos_consecutivos: 0 });
      const result = service.applyLoss(user);
      expect(result.newRango).toBe('A');
    });

    it('always returns rankUpgraded as false', () => {
      const user = makeUser({ rango: 'S', retos_consecutivos: 5 });
      const result = service.applyLoss(user);
      expect(result.rankUpgraded).toBe(false);
    });
  });
});
