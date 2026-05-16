import {
  isValidTransition,
  VALID_TRANSITIONS,
  ACTIVE_CHALLENGE_STATES,
  EstadoChallenge,
} from '../../domain/entities/Challenge';

describe('Challenge entity', () => {
  describe('isValidTransition', () => {
    // Valid transitions
    it('allows pendiente → aceptado', () => {
      expect(isValidTransition('pendiente', 'aceptado')).toBe(true);
    });

    it('allows pendiente → rechazado', () => {
      expect(isValidTransition('pendiente', 'rechazado')).toBe(true);
    });

    it('allows pendiente → cancelado', () => {
      expect(isValidTransition('pendiente', 'cancelado')).toBe(true);
    });

    it('allows aceptado → en_curso', () => {
      expect(isValidTransition('aceptado', 'en_curso')).toBe(true);
    });

    it('allows aceptado → cancelado', () => {
      expect(isValidTransition('aceptado', 'cancelado')).toBe(true);
    });

    it('allows en_curso → completado', () => {
      expect(isValidTransition('en_curso', 'completado')).toBe(true);
    });

    it('allows en_curso → cancelado', () => {
      expect(isValidTransition('en_curso', 'cancelado')).toBe(true);
    });

    // Invalid transitions
    it('blocks pendiente → completado', () => {
      expect(isValidTransition('pendiente', 'completado')).toBe(false);
    });

    it('blocks pendiente → en_curso', () => {
      expect(isValidTransition('pendiente', 'en_curso')).toBe(false);
    });

    it('blocks aceptado → rechazado', () => {
      expect(isValidTransition('aceptado', 'rechazado')).toBe(false);
    });

    it('blocks aceptado → completado directly', () => {
      expect(isValidTransition('aceptado', 'completado')).toBe(false);
    });

    // Terminal states have no valid transitions
    const terminalStates: EstadoChallenge[] = ['rechazado', 'completado', 'cancelado'];
    const allStates: EstadoChallenge[] = ['pendiente', 'aceptado', 'rechazado', 'en_curso', 'completado', 'cancelado'];

    terminalStates.forEach((terminal) => {
      allStates.forEach((target) => {
        it(`blocks ${terminal} → ${target} (terminal state)`, () => {
          expect(isValidTransition(terminal, target)).toBe(false);
        });
      });
    });
  });

  describe('VALID_TRANSITIONS map', () => {
    it('covers all six states', () => {
      const states = Object.keys(VALID_TRANSITIONS);
      expect(states).toHaveLength(6);
    });

    it('terminal states have empty transition arrays', () => {
      expect(VALID_TRANSITIONS.rechazado).toEqual([]);
      expect(VALID_TRANSITIONS.completado).toEqual([]);
      expect(VALID_TRANSITIONS.cancelado).toEqual([]);
    });
  });

  describe('ACTIVE_CHALLENGE_STATES', () => {
    it('includes pendiente, aceptado, en_curso', () => {
      expect(ACTIVE_CHALLENGE_STATES).toContain('pendiente');
      expect(ACTIVE_CHALLENGE_STATES).toContain('aceptado');
      expect(ACTIVE_CHALLENGE_STATES).toContain('en_curso');
    });

    it('does not include terminal states', () => {
      expect(ACTIVE_CHALLENGE_STATES).not.toContain('completado');
      expect(ACTIVE_CHALLENGE_STATES).not.toContain('rechazado');
      expect(ACTIVE_CHALLENGE_STATES).not.toContain('cancelado');
    });
  });
});
