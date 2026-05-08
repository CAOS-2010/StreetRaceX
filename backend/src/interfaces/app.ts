// Express app factory
// Wires together all layers following Hexagonal Architecture

import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from '../docs/openapi';

// Infrastructure
import prisma from '../infrastructure/database/prisma/PrismaClient';
import { PrismaUserRepository } from '../infrastructure/database/repositories/PrismaUserRepository';
import { PrismaVehicleRepository } from '../infrastructure/database/repositories/PrismaVehicleRepository';
import { PrismaChallengeRepository } from '../infrastructure/database/repositories/PrismaChallengeRepository';
import { PrismaNotificationRepository } from '../infrastructure/database/repositories/PrismaNotificationRepository';
import { BcryptHashService } from '../infrastructure/services/BcryptHashService';
import { JwtService } from '../infrastructure/services/JwtService';
import { IRealtimeService } from '../application/ports/IRealtimeService';

// Use Cases
import { RegisterUseCase } from '../application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '../application/use-cases/auth/LoginUseCase';
import { GetProfileUseCase } from '../application/use-cases/users/GetProfileUseCase';
import { DiscoverUsersUseCase } from '../application/use-cases/users/DiscoverUsersUseCase';
import { UpdateProfileUseCase } from '../application/use-cases/users/UpdateProfileUseCase';
import { CreateVehicleUseCase } from '../application/use-cases/vehicles/CreateVehicleUseCase';
import { UpdateVehicleUseCase } from '../application/use-cases/vehicles/UpdateVehicleUseCase';
import { DeleteVehicleUseCase } from '../application/use-cases/vehicles/DeleteVehicleUseCase';
import { ActivateVehicleUseCase } from '../application/use-cases/vehicles/ActivateVehicleUseCase';
import { CreateChallengeUseCase } from '../application/use-cases/challenges/CreateChallengeUseCase';
import { UpdateChallengeStatusUseCase } from '../application/use-cases/challenges/UpdateChallengeStatusUseCase';
import { RegisterResultUseCase } from '../application/use-cases/challenges/RegisterResultUseCase';
import { GetChallengeHistoryUseCase } from '../application/use-cases/challenges/GetChallengeHistoryUseCase';
import { GetNotificationsUseCase } from '../application/use-cases/notifications/GetNotificationsUseCase';
import { MarkNotificationReadUseCase } from '../application/use-cases/notifications/MarkNotificationReadUseCase';

// Controllers
import { AuthController } from './http/controllers/AuthController';
import { UserController } from './http/controllers/UserController';
import { VehicleController } from './http/controllers/VehicleController';
import { ChallengeController } from './http/controllers/ChallengeController';
import { NotificationController } from './http/controllers/NotificationController';

// Middlewares
import { createAuthMiddleware } from './http/middlewares/authMiddleware';
import { errorMiddleware } from './http/middlewares/errorMiddleware';

// Routes
import { createAuthRouter } from './http/routes/authRoutes';
import { createUserRouter } from './http/routes/userRoutes';
import { createVehicleRouter } from './http/routes/vehicleRoutes';
import { createChallengeRouter } from './http/routes/challengeRoutes';
import { createNotificationRouter } from './http/routes/notificationRoutes';

export function createApp(realtimeService: IRealtimeService): Application {
  const app = express();

  // ── Middleware ──────────────────────────────────────
  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Infrastructure instances ────────────────────────
  const userRepo = new PrismaUserRepository(prisma);
  const vehicleRepo = new PrismaVehicleRepository(prisma);
  const challengeRepo = new PrismaChallengeRepository(prisma);
  const notificationRepo = new PrismaNotificationRepository(prisma);

  const hashService = new BcryptHashService(
    parseInt(process.env.BCRYPT_ROUNDS ?? '10'),
  );
  const jwtService = new JwtService(
    process.env.JWT_SECRET!,
    process.env.JWT_EXPIRES_IN ?? '7d',
  );

  // ── Auth middleware ─────────────────────────────────
  const authMiddleware = createAuthMiddleware(jwtService);

  // ── Use Cases ───────────────────────────────────────
  const registerUseCase = new RegisterUseCase(userRepo, hashService, jwtService);
  const loginUseCase = new LoginUseCase(userRepo, hashService, jwtService);

  const getProfileUseCase = new GetProfileUseCase(userRepo, vehicleRepo);
  const discoverUseCase = new DiscoverUsersUseCase(userRepo, vehicleRepo);
  const updateProfileUseCase = new UpdateProfileUseCase(userRepo);

  const createVehicleUseCase = new CreateVehicleUseCase(vehicleRepo);
  const updateVehicleUseCase = new UpdateVehicleUseCase(vehicleRepo);
  const deleteVehicleUseCase = new DeleteVehicleUseCase(vehicleRepo);
  const activateVehicleUseCase = new ActivateVehicleUseCase(vehicleRepo);

  const createChallengeUseCase = new CreateChallengeUseCase(
    userRepo, vehicleRepo, challengeRepo, notificationRepo, realtimeService,
  );
  const updateChallengeStatusUseCase = new UpdateChallengeStatusUseCase(
    userRepo, challengeRepo, notificationRepo, realtimeService,
  );
  const registerResultUseCase = new RegisterResultUseCase(
    userRepo, challengeRepo, notificationRepo, realtimeService,
  );
  const getHistoryUseCase = new GetChallengeHistoryUseCase(challengeRepo);

  const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepo);
  const markReadUseCase = new MarkNotificationReadUseCase(notificationRepo);

  // ── Controllers ─────────────────────────────────────
  const authController = new AuthController(registerUseCase, loginUseCase);
  const userController = new UserController(getProfileUseCase, discoverUseCase, updateProfileUseCase);
  const vehicleController = new VehicleController(
    createVehicleUseCase, updateVehicleUseCase, deleteVehicleUseCase, activateVehicleUseCase, vehicleRepo,
  );
  const challengeController = new ChallengeController(
    createChallengeUseCase, updateChallengeStatusUseCase, registerResultUseCase, getHistoryUseCase,
  );
  const notificationController = new NotificationController(getNotificationsUseCase, markReadUseCase);

  // ── Routes ──────────────────────────────────────────
  app.use('/auth', createAuthRouter(authController));
  app.use('/users', createUserRouter(userController, authMiddleware));
  app.use('/vehicles', createVehicleRouter(vehicleController, authMiddleware));
  app.use('/challenges', createChallengeRouter(challengeController, authMiddleware));
  app.use('/notifications', createNotificationRouter(notificationController, authMiddleware));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── API Documentation ───────────────────────────────
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customSiteTitle: 'StreetRaceX API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      tryItOutEnabled: true,
    },
  }));

  // ── Error handler (must be last) ────────────────────
  app.use(errorMiddleware);

  return app;
}
