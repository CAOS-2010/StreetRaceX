// Server entry point
// Creates HTTP server, attaches Socket.io, and starts listening

import 'dotenv/config';
import http from 'http';
import { createApp } from './interfaces/app';
import { SocketServer } from './infrastructure/websocket/SocketServer';
import { JwtService } from './infrastructure/services/JwtService';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

// Build JWT service first (needed by both app and socket auth)
const jwtService = new JwtService(
  process.env.JWT_SECRET!,
  process.env.JWT_EXPIRES_IN ?? '7d',
);

// Create Socket.io server (it also implements IRealtimeService)
// We need to create the HTTP server before the app to pass it to SocketServer
const httpServer = http.createServer();

const socketServer = new SocketServer(
  httpServer,
  jwtService,
  process.env.FRONTEND_URL ?? 'http://localhost:5173',
);

// Create Express app with the realtime service injected
const app = createApp(socketServer);

// Attach Express to the HTTP server
httpServer.on('request', app);

// Start
httpServer.listen(PORT, () => {
  console.log(`
  
  StreetRaceX API Server         
  Running on http://localhost:${PORT}     
  Environment: ${process.env.NODE_ENV ?? 'development'}              ║
  
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received — shutting down gracefully');
  httpServer.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
});
