// Port: Realtime notification service (Socket.io adapter)

export type RealtimeEvent =
  | 'challenge:received'
  | 'challenge:accepted'
  | 'challenge:rejected'
  | 'challenge:completed'
  | 'rank:upgraded'
  | 'notification:new';

export interface IRealtimeService {
  emitToUser(userId: string, event: RealtimeEvent, data: unknown): void;
}
