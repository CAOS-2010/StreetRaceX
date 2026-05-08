// Infrastructure: Socket.io server
// Manages user rooms and real-time event emission

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { IJwtService } from '../../application/ports/IJwtService';
import { IRealtimeService, RealtimeEvent } from '../../application/ports/IRealtimeService';

export class SocketServer implements IRealtimeService {
  private io: SocketIOServer;

  constructor(httpServer: HttpServer, jwtService: IJwtService, corsOrigin: string) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupMiddleware(jwtService);
    this.setupHandlers();
  }

  private setupMiddleware(jwtService: IJwtService): void {
    // Authenticate socket connections via JWT
    this.io.use((socket: Socket, next) => {
      const token =
        socket.handshake.auth?.token ??
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const payload = jwtService.verify(token as string);
        (socket as any).userId = payload.sub;
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    });
  }

  private setupHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId as string;

      // Each user joins their own room for targeted events
      socket.join(`user:${userId}`);
      console.log(`[Socket] User ${userId} connected (socket: ${socket.id})`);

      socket.on('disconnect', () => {
        console.log(`[Socket] User ${userId} disconnected`);
      });
    });
  }

  emitToUser(userId: string, event: RealtimeEvent, data: unknown): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  getIO(): SocketIOServer {
    return this.io;
  }
}
