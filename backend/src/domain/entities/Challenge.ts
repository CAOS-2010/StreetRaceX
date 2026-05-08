// Domain Entity: Challenge

export type EstadoChallenge =
  | 'pendiente'
  | 'aceptado'
  | 'rechazado'
  | 'en_curso'
  | 'completado'
  | 'cancelado';

export type TipoCarrera = 'cuarto_milla' | 'vueltas' | 'derrape';

export interface Challenge {
  id: string;
  retador_id: string;
  retado_id: string;
  vehiculo_retador_id: string;
  vehiculo_retado_id?: string | null;
  tipo_carrera: TipoCarrera;
  estado: EstadoChallenge;
  ganador_id?: string | null;
  ubicacion_acordada?: string | null;
  fecha_acordada?: Date | null;
  notas?: string | null;
  created_at: Date;
  updated_at: Date;
}

// States that represent an ongoing/active challenge between two users
export const ACTIVE_CHALLENGE_STATES: EstadoChallenge[] = [
  'pendiente',
  'aceptado',
  'en_curso',
];

// Valid transitions for challenge state machine
export const VALID_TRANSITIONS: Record<EstadoChallenge, EstadoChallenge[]> = {
  pendiente: ['aceptado', 'rechazado', 'cancelado'],
  aceptado: ['en_curso', 'cancelado'],
  en_curso: ['completado', 'cancelado'],
  rechazado: [],
  completado: [],
  cancelado: [],
};

export function isValidTransition(
  from: EstadoChallenge,
  to: EstadoChallenge,
): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
