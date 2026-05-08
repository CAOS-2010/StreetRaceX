// Domain Entity: Notification

export type TipoNotificacion =
  | 'reto_recibido'
  | 'reto_aceptado'
  | 'reto_rechazado'
  | 'resultado'
  | 'rango_subido';

export interface Notification {
  id: string;
  user_id: string;
  tipo: TipoNotificacion;
  mensaje: string;
  leida: boolean;
  referencia_id?: string | null;
  created_at: Date;
}
