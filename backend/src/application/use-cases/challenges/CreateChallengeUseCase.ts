// Use Case: Send a challenge to another pilot

import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { IChallengeRepository } from '../../../domain/repositories/IChallengeRepository';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { IRealtimeService } from '../../ports/IRealtimeService';
import { Challenge, TipoCarrera } from '../../../domain/entities/Challenge';

export interface CreateChallengeInput {
  retadorId: string;
  retadoId: string;
  tipo_carrera: TipoCarrera;
  ubicacion_acordada?: string;
  fecha_acordada?: Date;
  notas?: string;
}

export class CreateChallengeUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly vehicleRepo: IVehicleRepository,
    private readonly challengeRepo: IChallengeRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly realtimeService: IRealtimeService,
  ) {}

  async execute(input: CreateChallengeInput): Promise<Challenge> {
    const { retadorId, retadoId } = input;

    // Rule 12: Cannot challenge yourself
    if (retadorId === retadoId) {
      throw new Error('SELF_CHALLENGE_NOT_ALLOWED');
    }

    // Load both users
    const [retador, retado] = await Promise.all([
      this.userRepo.findById(retadorId),
      this.userRepo.findById(retadoId),
    ]);
    if (!retador) throw new Error('USER_NOT_FOUND');
    if (!retado) throw new Error('TARGET_USER_NOT_FOUND');

    // Rule 4: Both need a vehicle to send/accept challenges
    const [vehiculoRetador, vehiculoRetado] = await Promise.all([
      this.vehicleRepo.findActiveByUserId(retadorId),
      this.vehicleRepo.findActiveByUserId(retadoId),
    ]);
    if (!vehiculoRetador) throw new Error('RETADOR_NO_ACTIVE_VEHICLE');
    if (!vehiculoRetado) throw new Error('RETADO_NO_ACTIVE_VEHICLE');

    // Rule 6: Same rank
    if (retador.rango !== retado.rango) {
      throw new Error('RANK_MISMATCH');
    }

    // Rule 7: Same vehicle type
    if (vehiculoRetador.tipo_vehiculo !== vehiculoRetado.tipo_vehiculo) {
      throw new Error('VEHICLE_TYPE_MISMATCH');
    }

    // Rule 8: No duplicate active challenge between these two
    const existing = await this.challengeRepo.findActiveChallengeBetweenUsers(
      retadorId,
      retadoId,
    );
    if (existing) {
      throw new Error('ACTIVE_CHALLENGE_EXISTS');
    }

    // Create the challenge
    const challenge = await this.challengeRepo.create({
      retador_id: retadorId,
      retado_id: retadoId,
      vehiculo_retador_id: vehiculoRetador.id,
      vehiculo_retado_id: vehiculoRetado.id,
      tipo_carrera: input.tipo_carrera,
      estado: 'pendiente',
      ganador_id: null,
      ubicacion_acordada: input.ubicacion_acordada ?? null,
      fecha_acordada: input.fecha_acordada ?? null,
      notas: input.notas ?? null,
    });

    // Create notification for retado
    const notification = await this.notificationRepo.create({
      user_id: retadoId,
      tipo: 'reto_recibido',
      mensaje: `@${retador.username} te ha lanzado un reto de ${input.tipo_carrera.replace('_', ' ')}!`,
      leida: false,
      referencia_id: challenge.id,
    });

    // Emit real-time event
    this.realtimeService.emitToUser(retadoId, 'challenge:received', {
      challenge,
      retador: { id: retador.id, username: retador.username, rango: retador.rango },
    });
    this.realtimeService.emitToUser(retadoId, 'notification:new', notification);

    return challenge;
  }
}
