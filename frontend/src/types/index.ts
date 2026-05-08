// Shared TypeScript types matching the backend domain

export type Rango = 'S' | 'A' | 'B' | 'C' | 'D';
export type TipoVehiculo = 'auto' | 'moto' | 'monopatin_electrico';
export type EstadoChallenge = 'pendiente' | 'aceptado' | 'rechazado' | 'en_curso' | 'completado' | 'cancelado';
export type TipoCarrera = 'cuarto_milla' | 'vueltas' | 'derrape';
export type TipoNotificacion = 'reto_recibido' | 'reto_aceptado' | 'reto_rechazado' | 'resultado' | 'rango_subido';

export interface User {
  id: string;
  username: string;
  email: string;
  foto_perfil?: string | null;
  zona_ciudad?: string | null;
  zona_pais?: string | null;
  rango: Rango;
  victorias: number;
  derrotas: number;
  retos_consecutivos: number;
  estado: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  tipo_vehiculo: TipoVehiculo;
  marca: string;
  modelo: string;
  anio: number;
  color?: string | null;
  placa?: string | null;
  activo: boolean;
  modificaciones?: string | null;
}

export interface Challenge {
  id: string;
  retador_id: string;
  retado_id: string;
  tipo_carrera: TipoCarrera;
  estado: EstadoChallenge;
  ganador_id?: string | null;
  ubicacion_acordada?: string | null;
  fecha_acordada?: string | null;
  notas?: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  tipo: TipoNotificacion;
  mensaje: string;
  leida: boolean;
  referencia_id?: string | null;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
}
