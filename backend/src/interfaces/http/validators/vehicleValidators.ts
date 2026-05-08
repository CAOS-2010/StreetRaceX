// Zod validators for Vehicle endpoints

import { z } from 'zod';

const tipoVehiculoEnum = z.enum(['auto', 'moto', 'monopatin_electrico']);

export const createVehicleSchema = z.object({
  tipo_vehiculo: tipoVehiculoEnum,
  marca: z.string().min(1).max(50),
  modelo: z.string().min(1).max(50),
  anio: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().max(30).optional(),
  placa: z.string().max(20).optional(),
  foto: z.string().url().optional(),
  modificaciones: z.string().max(500).optional(),
});

export const updateVehicleSchema = z.object({
  marca: z.string().min(1).max(50).optional(),
  modelo: z.string().min(1).max(50).optional(),
  anio: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  color: z.string().max(30).optional(),
  foto: z.string().url().optional(),
  modificaciones: z.string().max(500).optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
