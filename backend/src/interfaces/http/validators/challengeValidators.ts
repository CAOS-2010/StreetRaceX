// Zod validators for Challenge endpoints

import { z } from 'zod';

export const createChallengeSchema = z.object({
  retado_id: z.string().uuid('Invalid user ID'),
  tipo_carrera: z.enum(['cuarto_milla', 'vueltas', 'derrape']),
  ubicacion_acordada: z.string().max(200).optional(),
  fecha_acordada: z.string().datetime().optional(),
  notas: z.string().max(500).optional(),
});

export const updateChallengeStatusSchema = z.object({
  estado: z.enum(['aceptado', 'rechazado', 'cancelado', 'en_curso']),
});

export const registerResultSchema = z.object({
  ganador_id: z.string().uuid('Invalid user ID'),
});

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type UpdateChallengeStatusInput = z.infer<typeof updateChallengeStatusSchema>;
export type RegisterResultInput = z.infer<typeof registerResultSchema>;
