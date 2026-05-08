// Domain Entity: User
// Pure TypeScript — no framework or ORM dependency

export type Rango = 'S' | 'A' | 'B' | 'C' | 'D';
export type EstadoUsuario = 'activo' | 'inactivo' | 'suspendido';
export type RolUsuario = 'piloto' | 'administrador';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  foto_perfil?: string | null;
  zona_localidad?: string | null;
  zona_ciudad?: string | null;
  zona_estado?: string | null;
  zona_pais?: string | null;
  rango: Rango;
  rol: RolUsuario;
  victorias: number;
  derrotas: number;
  retos_consecutivos: number;
  estado: EstadoUsuario;
  created_at: Date;
  updated_at: Date;
}

// The rank order — used by RankService
export const RANK_ORDER: Rango[] = ['D', 'C', 'B', 'A', 'S'];

export function getNextRank(current: Rango): Rango | null {
  const idx = RANK_ORDER.indexOf(current);
  if (idx === -1 || idx === RANK_ORDER.length - 1) return null; // S has no next
  return RANK_ORDER[idx + 1];
}

// Safe public profile (no password_hash)
export type PublicUser = Omit<User, 'password_hash'>;

export function toPublicUser(user: User): PublicUser {
  const { password_hash, ...rest } = user;
  return rest;
}
