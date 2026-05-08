// Domain Entity: Vehicle

export type TipoVehiculo = 'auto' | 'moto' | 'monopatin_electrico';

export interface Vehicle {
  id: string;
  user_id: string;
  tipo_vehiculo: TipoVehiculo;
  marca: string;
  modelo: string;
  anio: number;
  color?: string | null;
  placa?: string | null;
  foto?: string | null;
  modificaciones?: string | null;
  activo: boolean;
  created_at: Date;
}

export const MAX_VEHICLES_PER_USER = 3;
