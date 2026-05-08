# StreetRaceX

Plataforma de retos de carreras callejeras en tiempo real — como Tinder para carreras. Los pilotos descubren rivales del mismo rango y tipo de vehículo, envían retos y escalan desde el Rango D hasta el legendario Rango S.

> **Entrega 2 — API REST Completa**
> La documentación interactiva está disponible en `http://localhost:3000/api-docs` al levantar el servidor.

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js 4 |
| Language | TypeScript 5 (strict) |
| Database | PostgreSQL + Prisma ORM |
| Real-time | Socket.io 4 |
| Auth | JWT + bcrypt |
| Architecture | Hexagonal (Ports & Adapters) |
| Frontend | React 18 + Vite + TypeScript |

## Project Structure

```
StreetRaceX/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # DB schema (all entities, enums)
│   │   └── seed.ts                # Test data
│   └── src/
│       ├── domain/                # Pure business logic — no framework deps
│       │   ├── entities/          # User, Vehicle, Challenge, Notification
│       │   ├── repositories/      # Repository interfaces (ports)
│       │   └── services/          # RankService (domain logic)
│       ├── application/           # Use cases orchestrate domain + ports
│       │   ├── ports/             # IHashService, IJwtService, IRealtimeService
│       │   └── use-cases/         # auth/, users/, vehicles/, challenges/, notifications/
│       ├── infrastructure/        # Adapters — Prisma, bcrypt, JWT, Socket.io
│       │   ├── database/
│       │   │   └── repositories/  # Prisma implementations
│       │   ├── services/          # BcryptHashService, JwtService
│       │   └── websocket/         # SocketServer (implements IRealtimeService)
│       └── interfaces/            # HTTP layer
│           ├── http/
│           │   ├── controllers/   # One per resource
│           │   ├── middlewares/   # JWT auth, Zod validation, error handler
│           │   ├── routes/        # Express routers
│           │   └── validators/    # Zod schemas
│           └── app.ts             # Dependency wiring (composition root)
└── frontend/
    └── src/
        ├── context/               # AuthContext (JWT, Socket.io)
        ├── services/              # Axios API client, Socket.io client
        ├── hooks/                 # useSocketEvent
        ├── components/            # Navbar, PrivateRoute
        └── pages/                 # Login, Register, Dashboard, Profile,
                                   # Vehicles, Challenges, Notifications
```

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a cloud database)
- npm or yarn

## Backend Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/streetracex?schema=public"
JWT_SECRET=your_secret_here
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 3. Create the database

```sql
-- In psql or your PostgreSQL client:
CREATE DATABASE streetracex;
```

### 4. Run migrations

```bash
npm run prisma:migrate
# When prompted for migration name, type: init
```

### 5. Generate Prisma client

```bash
npm run prisma:generate
```

### 6. Seed test data (optional)

```bash
npm run seed
```

This creates 5 test users:

| Email | Password | Rank |
|-------|----------|------|
| admin@streetracex.com | admin123 | S |
| speed@race.com | password123 | B |
| nitro@race.com | password123 | B |
| drift@race.com | password123 | A |
| rookie@race.com | password123 | D |

### 7. Start the server

```bash
# Development (hot reload)
npm run dev

# Production
npm run build && npm start
```

The API will be available at `http://localhost:3000`.

### 8. Open the interactive API docs

```
http://localhost:3000/api-docs
```

Swagger UI with all 20 endpoints, real request/response examples, and built-in JWT authorization.
To test protected endpoints: click **Authorize**, paste the token from `POST /auth/login`.

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`. It proxies API requests to `localhost:3000`.

## API Reference

All responses follow this format:

```json
// Success
{ "success": true, "data": {}, "message": "..." }

// Error
{ "success": false, "error": "...", "statusCode": 400 }
```

### Auth (public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new pilot |
| POST | `/auth/login` | Login, returns JWT |

### Users (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Own profile |
| PATCH | `/users/me` | Update profile |
| GET | `/users/:id` | Public profile |
| GET | `/users/discover` | Find rivals (same rank + vehicle type) |

**Discover query params:** `zona_ciudad`, `zona_pais`, `page`, `limit`

### Vehicles (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/vehicles` | Add vehicle (max 3) |
| GET | `/vehicles` | List my vehicles |
| PATCH | `/vehicles/:id` | Update vehicle |
| DELETE | `/vehicles/:id` | Delete vehicle |
| PATCH | `/vehicles/:id/activate` | Set as active |

### Challenges (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/challenges` | Send challenge |
| PATCH | `/challenges/:id/status` | Accept / reject / cancel |
| POST | `/challenges/:id/result` | Register winner |
| GET | `/challenges/history` | My challenge history |
| DELETE | `/challenges/:id` | Cancel (if pending) |

**Status values:** `aceptado`, `rechazado`, `cancelado`, `en_curso`

### Notifications (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | My notifications |
| PATCH | `/notifications/:id/read` | Mark as read |
| PATCH | `/notifications/read-all` | Mark all as read |

## WebSocket Events

Connect with: `io(URL, { auth: { token: 'JWT_HERE' } })`

Each user is placed in their own room `user:<id>`.

| Event | Direction | Description |
|-------|-----------|-------------|
| `challenge:received` | Server → Client | A new challenge arrived |
| `challenge:accepted` | Server → Client | Your challenge was accepted |
| `challenge:rejected` | Server → Client | Your challenge was rejected |
| `challenge:completed` | Server → Client | Race result registered |
| `rank:upgraded` | Server → Client | You leveled up! |
| `notification:new` | Server → Client | New notification |

## Business Rules

1. **Same Rank** — pilots can only challenge others at the exact same rank (D/C/B/A/S)
2. **Same Vehicle Type** — active vehicles must be the same type (auto/moto/monopatin_electrico)
3. **No Self-Challenges** — a pilot cannot challenge themselves
4. **No Duplicate Active Challenges** — one active challenge per pair of pilots
5. **Max 3 Vehicles** — per user account
6. **One Active Vehicle** — only one vehicle can be active at a time
7. **Rank Up** — 2 consecutive wins at current rank → automatic promotion
8. **Loss Penalty** — a loss reduces win streak by 1 (minimum 0); no demotion
9. **No Demotion** — rank never goes down
10. **Vehicle Required** — both pilots need an active vehicle to send/accept challenges

## Architecture Notes

The codebase follows **Hexagonal Architecture** (Ports & Adapters):

- **Domain layer** — pure TypeScript entities and repository interfaces. Zero dependencies on Express, Prisma, or any framework.
- **Application layer** — use cases that orchestrate domain objects and call ports. The only things injected are interfaces.
- **Infrastructure layer** — concrete implementations of ports: Prisma repositories, BcryptHashService, JwtService, SocketServer.
- **Interfaces layer** — Express HTTP adapters: controllers, routes, validators, and middlewares.

The dependency rule flows strictly inward: Infrastructure → Application → Domain.
