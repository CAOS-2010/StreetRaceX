// OpenAPI 3.0 specification for StreetRaceX API
// Mounted at GET /api-docs via swagger-ui-express

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'StreetRaceX API',
    version: '1.0.0',
    description:
      'REST API para la plataforma de retos de carreras callejeras. ' +
      'Los pilotos descubren rivales del mismo rango y tipo de vehículo, ' +
      'envían retos y escalan de rango D hasta el legendario rango S.\n\n' +
      '**Arquitectura:** Hexagonal (Ports & Adapters)\n\n' +
      '**Autenticación:** Bearer JWT — obtén el token en `POST /auth/login` ' +
      'y pégalo en el botón **Authorize** (arriba a la derecha).',
    contact: {
      name: 'StreetRaceX',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Registro e inicio de sesión' },
    { name: 'Users', description: 'Perfiles de pilotos y descubrimiento de rivales' },
    { name: 'Vehicles', description: 'Gestión de vehículos (máx. 3 por piloto)' },
    { name: 'Challenges', description: 'Retos entre pilotos del mismo rango' },
    { name: 'Notifications', description: 'Notificaciones del sistema' },
    { name: 'Health', description: 'Estado del servidor' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido en POST /auth/login',
      },
    },
    schemas: {
      // ── Enums ──────────────────────────────────────────
      Rango: {
        type: 'string',
        enum: ['D', 'C', 'B', 'A', 'S'],
        example: 'B',
        description: 'D (principiante) → C → B → A → S (leyenda). Nunca baja.',
      },
      TipoVehiculo: {
        type: 'string',
        enum: ['auto', 'moto', 'monopatin_electrico'],
        example: 'auto',
      },
      TipoCarrera: {
        type: 'string',
        enum: ['cuarto_milla', 'vueltas', 'derrape'],
        example: 'cuarto_milla',
      },
      EstadoChallenge: {
        type: 'string',
        enum: ['pendiente', 'aceptado', 'rechazado', 'en_curso', 'completado', 'cancelado'],
        example: 'pendiente',
      },

      // ── Success wrapper ────────────────────────────────
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          message: { type: 'string' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'INVALID_CREDENTIALS' },
          statusCode: { type: 'integer', example: 401 },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Validation failed' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email' },
              },
            },
          },
          statusCode: { type: 'integer', example: 400 },
        },
      },

      // ── Auth ───────────────────────────────────────────
      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: {
            type: 'string',
            minLength: 3,
            maxLength: 30,
            pattern: '^[a-zA-Z0-9_]+$',
            example: 'SpeedRacer99',
          },
          email: { type: 'string', format: 'email', example: 'racer@speed.com' },
          password: { type: 'string', minLength: 6, example: 'secret123' },
          zona_ciudad: { type: 'string', example: 'Bogotá' },
          zona_pais: { type: 'string', example: 'Colombia' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'speed@race.com' },
          password: { type: 'string', example: 'password123' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          user: { $ref: '#/components/schemas/PublicUser' },
        },
      },

      // ── User ───────────────────────────────────────────
      PublicUser: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          username: { type: 'string', example: 'SpeedMaster' },
          email: { type: 'string', example: 'speed@race.com' },
          foto_perfil: { type: 'string', nullable: true, example: null },
          zona_ciudad: { type: 'string', nullable: true, example: 'Bogotá' },
          zona_pais: { type: 'string', nullable: true, example: 'Colombia' },
          rango: { $ref: '#/components/schemas/Rango' },
          rol: { type: 'string', enum: ['piloto', 'administrador'], example: 'piloto' },
          victorias: { type: 'integer', example: 12 },
          derrotas: { type: 'integer', example: 4 },
          retos_consecutivos: { type: 'integer', example: 1 },
          estado: { type: 'string', enum: ['activo', 'inactivo', 'suspendido'], example: 'activo' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ProfileResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/PublicUser' },
          activeVehicle: { $ref: '#/components/schemas/Vehicle' },
          vehicles: {
            type: 'array',
            items: { $ref: '#/components/schemas/Vehicle' },
          },
        },
      },
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'NuevoNombre' },
          foto_perfil: { type: 'string', example: 'https://example.com/foto.jpg' },
          zona_localidad: { type: 'string', example: 'Suba' },
          zona_ciudad: { type: 'string', example: 'Bogotá' },
          zona_estado: { type: 'string', example: 'Cundinamarca' },
          zona_pais: { type: 'string', example: 'Colombia' },
        },
      },

      // ── Vehicle ────────────────────────────────────────
      Vehicle: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'f1e2d3c4-b5a6-7890-fedc-ba0987654321' },
          user_id: { type: 'string', format: 'uuid' },
          tipo_vehiculo: { $ref: '#/components/schemas/TipoVehiculo' },
          marca: { type: 'string', example: 'Toyota' },
          modelo: { type: 'string', example: 'Supra MK4' },
          anio: { type: 'integer', example: 1998 },
          color: { type: 'string', nullable: true, example: 'Blanco' },
          placa: { type: 'string', nullable: true, example: 'ABC-123' },
          foto: { type: 'string', nullable: true, example: null },
          modificaciones: { type: 'string', nullable: true, example: 'Motor 2JZ-GTE, turbo HKS' },
          activo: { type: 'boolean', example: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateVehicleRequest: {
        type: 'object',
        required: ['tipo_vehiculo', 'marca', 'modelo', 'anio'],
        properties: {
          tipo_vehiculo: { $ref: '#/components/schemas/TipoVehiculo' },
          marca: { type: 'string', example: 'Honda' },
          modelo: { type: 'string', example: 'Civic Type R' },
          anio: { type: 'integer', minimum: 1900, maximum: 2030, example: 2023 },
          color: { type: 'string', example: 'Rojo' },
          placa: { type: 'string', example: 'XYZ-789' },
          foto: { type: 'string', example: null },
          modificaciones: { type: 'string', example: 'Stage 2 tune, downpipe aftermarket' },
        },
      },
      UpdateVehicleRequest: {
        type: 'object',
        properties: {
          marca: { type: 'string', example: 'Honda' },
          modelo: { type: 'string', example: 'Civic Type R' },
          anio: { type: 'integer', example: 2023 },
          color: { type: 'string', example: 'Azul' },
          placa: { type: 'string', example: 'XYZ-001' },
          foto: { type: 'string', example: null },
          modificaciones: { type: 'string', example: 'Stage 3 tune' },
        },
      },

      // ── Challenge ──────────────────────────────────────
      Challenge: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'c1d2e3f4-a5b6-7890-cdef-012345678901' },
          retador_id: { type: 'string', format: 'uuid' },
          retado_id: { type: 'string', format: 'uuid' },
          vehiculo_retador_id: { type: 'string', format: 'uuid' },
          vehiculo_retado_id: { type: 'string', format: 'uuid', nullable: true },
          tipo_carrera: { $ref: '#/components/schemas/TipoCarrera' },
          estado: { $ref: '#/components/schemas/EstadoChallenge' },
          ganador_id: { type: 'string', format: 'uuid', nullable: true },
          ubicacion_acordada: { type: 'string', nullable: true, example: 'Aeropuerto Eldorado, Bogotá' },
          fecha_acordada: { type: 'string', format: 'date-time', nullable: true },
          notas: { type: 'string', nullable: true, example: 'Sin modificaciones permitidas' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateChallengeRequest: {
        type: 'object',
        required: ['retado_id', 'tipo_carrera'],
        properties: {
          retado_id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          tipo_carrera: { $ref: '#/components/schemas/TipoCarrera' },
          ubicacion_acordada: { type: 'string', example: 'Aeropuerto Eldorado, Bogotá' },
          fecha_acordada: { type: 'string', format: 'date-time', example: '2025-05-10T22:00:00.000Z' },
          notas: { type: 'string', example: 'Primer reto de la temporada' },
        },
      },
      UpdateStatusRequest: {
        type: 'object',
        required: ['estado'],
        properties: {
          estado: {
            type: 'string',
            enum: ['aceptado', 'rechazado', 'cancelado', 'en_curso'],
            example: 'aceptado',
            description:
              'retado → aceptado/rechazado | retador o retado → cancelado | cualquiera → en_curso',
          },
        },
      },
      RegisterResultRequest: {
        type: 'object',
        required: ['ganador_id'],
        properties: {
          ganador_id: {
            type: 'string',
            format: 'uuid',
            example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            description: 'ID del ganador (debe ser retador_id o retado_id)',
          },
        },
      },

      // ── Notification ───────────────────────────────────
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          tipo: {
            type: 'string',
            enum: ['reto_recibido', 'reto_aceptado', 'reto_rechazado', 'resultado', 'rango_subido'],
            example: 'reto_recibido',
          },
          mensaje: { type: 'string', example: '@NitroKing te ha lanzado un reto de cuarto milla!' },
          leida: { type: 'boolean', example: false },
          referencia_id: { type: 'string', format: 'uuid', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  },

  // ── Paths ────────────────────────────────────────────────────────────────
  paths: {
    // ── Health ──────────────────────────────────────────
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Estado del servidor',
        responses: {
          200: {
            description: 'Servidor activo',
            content: {
              'application/json': {
                example: { status: 'ok', timestamp: '2025-05-01T10:00:00.000Z' },
              },
            },
          },
        },
      },
    },

    // ── Auth ────────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar nuevo piloto',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
              example: {
                username: 'SpeedRacer99',
                email: 'racer@speed.com',
                password: 'secret123',
                zona_ciudad: 'Bogotá',
                zona_pais: 'Colombia',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Piloto registrado exitosamente',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWIyYzNkNCIsInJvbGUiOiJwaWxvdG8iLCJpYXQiOjE3MTQwMDAwMDB9.abc123',
                    user: {
                      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                      username: 'SpeedRacer99',
                      email: 'racer@speed.com',
                      rango: 'D',
                      rol: 'piloto',
                      victorias: 0,
                      derrotas: 0,
                      retos_consecutivos: 0,
                      estado: 'activo',
                      zona_ciudad: 'Bogotá',
                      zona_pais: 'Colombia',
                    },
                  },
                  message: 'Usuario registrado exitosamente',
                },
              },
            },
          },
          400: {
            description: 'Validación fallida',
            content: {
              'application/json': {
                example: {
                  success: false,
                  error: 'Validation failed',
                  details: [{ field: 'email', message: 'Invalid email' }],
                  statusCode: 400,
                },
              },
            },
          },
          409: {
            description: 'Email o username ya registrado',
            content: {
              'application/json': {
                example: { success: false, error: 'Email is already registered', statusCode: 409 },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        description: 'Devuelve un JWT válido por 7 días. Úsalo en el botón **Authorize**.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              example: { email: 'speed@race.com', password: 'password123' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login exitoso — copia el token y haz click en Authorize',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    user: {
                      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                      username: 'SpeedMaster',
                      email: 'speed@race.com',
                      rango: 'B',
                      victorias: 12,
                      derrotas: 4,
                    },
                  },
                  message: 'Inicio de sesión exitoso',
                },
              },
            },
          },
          401: {
            description: 'Credenciales inválidas',
            content: {
              'application/json': {
                example: { success: false, error: 'Invalid email or password', statusCode: 401 },
              },
            },
          },
        },
      },
    },

    // ── Users ────────────────────────────────────────────
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Mi perfil completo',
        description: 'Devuelve el perfil con vehículo activo y lista de vehículos.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Perfil del piloto autenticado',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    user: {
                      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                      username: 'SpeedMaster',
                      email: 'speed@race.com',
                      rango: 'B',
                      victorias: 12,
                      derrotas: 4,
                      retos_consecutivos: 1,
                      zona_ciudad: 'Bogotá',
                      zona_pais: 'Colombia',
                    },
                    activeVehicle: {
                      id: 'f1e2d3c4-b5a6-7890-fedc-ba0987654321',
                      tipo_vehiculo: 'auto',
                      marca: 'Toyota',
                      modelo: 'Supra MK4',
                      anio: 1998,
                      activo: true,
                    },
                    vehicles: [
                      {
                        id: 'f1e2d3c4-b5a6-7890-fedc-ba0987654321',
                        tipo_vehiculo: 'auto',
                        marca: 'Toyota',
                        modelo: 'Supra MK4',
                        anio: 1998,
                        activo: true,
                      },
                    ],
                  },
                  message: 'Profile retrieved',
                },
              },
            },
          },
          401: { description: 'Token inválido o ausente' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Actualizar mi perfil',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
              example: { zona_ciudad: 'Medellín', foto_perfil: 'https://example.com/foto.jpg' },
            },
          },
        },
        responses: {
          200: {
            description: 'Perfil actualizado',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    username: 'SpeedMaster',
                    zona_ciudad: 'Medellín',
                  },
                  message: 'Profile updated',
                },
              },
            },
          },
        },
      },
    },
    '/users/discover': {
      get: {
        tags: ['Users'],
        summary: 'Descubrir rivales',
        description:
          'Retorna pilotos activos del **mismo rango** y **mismo tipo de vehículo activo** que el piloto autenticado. Lógica "Tinder para carreras".',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'zona_ciudad', in: 'query', schema: { type: 'string' }, example: 'Bogotá' },
          { name: 'zona_pais', in: 'query', schema: { type: 'string' }, example: 'Colombia' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Lista paginada de rivales',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    users: [
                      {
                        id: 'b2c3d4e5-f6a7-8901-bcde-f01234567890',
                        username: 'NitroKing',
                        rango: 'B',
                        victorias: 8,
                        zona_ciudad: 'Bogotá',
                        activeVehicle: { tipo_vehiculo: 'auto', marca: 'Honda', modelo: 'Civic Type R' },
                      },
                    ],
                    total: 1,
                    page: 1,
                    limit: 10,
                  },
                  message: 'Pilots discovered',
                },
              },
            },
          },
          422: {
            description: 'Sin vehículo activo',
            content: {
              'application/json': {
                example: {
                  success: false,
                  error: 'You need an active vehicle to use this feature',
                  statusCode: 422,
                },
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Perfil público de un piloto',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Perfil del piloto' },
          404: {
            description: 'Usuario no encontrado',
            content: {
              'application/json': {
                example: { success: false, error: 'User not found', statusCode: 404 },
              },
            },
          },
        },
      },
    },

    // ── Vehicles ─────────────────────────────────────────
    '/vehicles': {
      post: {
        tags: ['Vehicles'],
        summary: 'Agregar vehículo (máx. 3)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateVehicleRequest' },
              example: {
                tipo_vehiculo: 'auto',
                marca: 'Honda',
                modelo: 'Civic Type R',
                anio: 2023,
                color: 'Rojo',
                placa: 'XYZ-789',
                modificaciones: 'Stage 2 tune, downpipe aftermarket',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Vehículo registrado',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    id: 'f1e2d3c4-b5a6-7890-fedc-ba0987654321',
                    tipo_vehiculo: 'auto',
                    marca: 'Honda',
                    modelo: 'Civic Type R',
                    anio: 2023,
                    color: 'Rojo',
                    placa: 'XYZ-789',
                    activo: false,
                  },
                  message: 'Vehicle registered',
                },
              },
            },
          },
          422: {
            description: 'Límite de 3 vehículos alcanzado',
            content: {
              'application/json': {
                example: {
                  success: false,
                  error: 'Maximum of 3 vehicles per user reached',
                  statusCode: 422,
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Vehicles'],
        summary: 'Listar mis vehículos',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Array de vehículos del piloto',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: [
                    {
                      id: 'f1e2d3c4-b5a6-7890-fedc-ba0987654321',
                      tipo_vehiculo: 'auto',
                      marca: 'Toyota',
                      modelo: 'Supra MK4',
                      anio: 1998,
                      activo: true,
                    },
                  ],
                  message: 'Vehicles retrieved',
                },
              },
            },
          },
        },
      },
    },
    '/vehicles/{id}': {
      patch: {
        tags: ['Vehicles'],
        summary: 'Actualizar vehículo',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateVehicleRequest' },
              example: { color: 'Negro', modificaciones: 'Turbo upgrade GT3076' },
            },
          },
        },
        responses: {
          200: { description: 'Vehículo actualizado' },
          403: {
            description: 'No es tu vehículo',
            content: {
              'application/json': {
                example: {
                  success: false,
                  error: 'You do not have permission to perform this action',
                  statusCode: 403,
                },
              },
            },
          },
          404: { description: 'Vehículo no encontrado' },
        },
      },
      delete: {
        tags: ['Vehicles'],
        summary: 'Eliminar vehículo',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Vehículo eliminado',
            content: {
              'application/json': {
                example: { success: true, data: null, message: 'Vehicle deleted' },
              },
            },
          },
          404: { description: 'Vehículo no encontrado' },
        },
      },
    },
    '/vehicles/{id}/activate': {
      patch: {
        tags: ['Vehicles'],
        summary: 'Activar vehículo',
        description: 'Marca este vehículo como activo. Desactiva automáticamente cualquier otro vehículo activo del usuario.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Vehículo activado',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    id: 'f1e2d3c4-b5a6-7890-fedc-ba0987654321',
                    tipo_vehiculo: 'auto',
                    marca: 'Toyota',
                    modelo: 'Supra MK4',
                    activo: true,
                  },
                  message: 'Vehicle activated',
                },
              },
            },
          },
        },
      },
    },

    // ── Challenges ───────────────────────────────────────
    '/challenges': {
      post: {
        tags: ['Challenges'],
        summary: 'Enviar reto',
        description:
          'Reglas validadas automáticamente:\n' +
          '- Mismo rango\n' +
          '- Mismo tipo de vehículo activo\n' +
          '- No auto-reto\n' +
          '- Sin reto activo duplicado entre estos dos pilotos',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateChallengeRequest' },
              example: {
                retado_id: 'b2c3d4e5-f6a7-8901-bcde-f01234567890',
                tipo_carrera: 'cuarto_milla',
                ubicacion_acordada: 'Aeropuerto Eldorado, Bogotá',
                fecha_acordada: '2025-05-10T22:00:00.000Z',
                notas: 'Primer reto de la temporada',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Reto enviado. El retado recibe notificación en tiempo real.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    id: 'c1d2e3f4-a5b6-7890-cdef-012345678901',
                    retador_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    retado_id: 'b2c3d4e5-f6a7-8901-bcde-f01234567890',
                    tipo_carrera: 'cuarto_milla',
                    estado: 'pendiente',
                    ubicacion_acordada: 'Aeropuerto Eldorado, Bogotá',
                  },
                  message: 'Challenge sent',
                },
              },
            },
          },
          422: {
            description: 'Regla de negocio violada',
            content: {
              'application/json': {
                examples: {
                  RANK_MISMATCH: {
                    summary: 'Rangos diferentes',
                    value: { success: false, error: 'You can only challenge pilots of the same rank', statusCode: 422 },
                  },
                  VEHICLE_TYPE_MISMATCH: {
                    summary: 'Tipos de vehículo distintos',
                    value: { success: false, error: 'Both pilots must have the same type of active vehicle', statusCode: 422 },
                  },
                  NO_ACTIVE_VEHICLE: {
                    summary: 'Sin vehículo activo',
                    value: { success: false, error: 'You need an active vehicle to send a challenge', statusCode: 422 },
                  },
                },
              },
            },
          },
          409: {
            description: 'Ya existe un reto activo entre estos pilotos',
            content: {
              'application/json': {
                example: {
                  success: false,
                  error: 'There is already an active challenge between these pilots',
                  statusCode: 409,
                },
              },
            },
          },
        },
      },
    },
    '/challenges/history': {
      get: {
        tags: ['Challenges'],
        summary: 'Historial de retos',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'rol',
            in: 'query',
            description: 'Filtrar por rol en el reto',
            schema: { type: 'string', enum: ['all', 'retador', 'retado'], default: 'all' },
          },
          {
            name: 'estado',
            in: 'query',
            description: 'Filtrar por estado',
            schema: { $ref: '#/components/schemas/EstadoChallenge' },
          },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Historial paginado',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    challenges: [
                      {
                        id: 'c1d2e3f4-a5b6-7890-cdef-012345678901',
                        tipo_carrera: 'cuarto_milla',
                        estado: 'completado',
                        ganador_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                      },
                    ],
                    total: 1,
                    page: 1,
                    limit: 10,
                  },
                  message: 'History retrieved',
                },
              },
            },
          },
        },
      },
    },
    '/challenges/{id}/status': {
      patch: {
        tags: ['Challenges'],
        summary: 'Cambiar estado del reto',
        description:
          '**Máquina de estados:**\n' +
          '`pendiente` → `aceptado` | `rechazado` | `cancelado`\n' +
          '`aceptado` → `en_curso` | `cancelado`\n' +
          '`en_curso` → `completado` | `cancelado`\n\n' +
          '**Permisos:** Solo el retado puede aceptar/rechazar. ' +
          'El retador puede cancelar si está pendiente. Cualquiera puede cancelar si está aceptado.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateStatusRequest' },
              example: { estado: 'aceptado' },
            },
          },
        },
        responses: {
          200: {
            description: 'Estado actualizado. Los participantes reciben evento Socket.io.',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    id: 'c1d2e3f4-a5b6-7890-cdef-012345678901',
                    estado: 'aceptado',
                    updated_at: '2025-05-01T14:30:00.000Z',
                  },
                  message: 'Challenge status updated',
                },
              },
            },
          },
          403: { description: 'Sin permiso para este cambio de estado' },
          404: { description: 'Reto no encontrado' },
        },
      },
    },
    '/challenges/{id}/result': {
      post: {
        tags: ['Challenges'],
        summary: 'Registrar resultado',
        description:
          'Registra el ganador del reto. Aplica automáticamente:\n' +
          '- +1 victoria al ganador, +1 al contador consecutivo\n' +
          '- 2 victorias consecutivas → **ascenso de rango** automático\n' +
          '- Al perder: streak -1 (mín. 0), sin descenso de rango\n' +
          '- Notificación a ambos participantes via Socket.io',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterResultRequest' },
              example: { ganador_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
            },
          },
        },
        responses: {
          200: {
            description: 'Resultado registrado',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    challenge: {
                      id: 'c1d2e3f4-a5b6-7890-cdef-012345678901',
                      estado: 'completado',
                      ganador_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    },
                    winnerRankUpgraded: false,
                  },
                  message: 'Result registered',
                },
              },
            },
          },
          422: {
            description: 'El reto debe estar aceptado o en curso',
            content: {
              'application/json': {
                example: {
                  success: false,
                  error: 'The challenge must be accepted or in progress to register a result',
                  statusCode: 422,
                },
              },
            },
          },
        },
      },
    },
    '/challenges/{id}': {
      delete: {
        tags: ['Challenges'],
        summary: 'Cancelar reto (si está pendiente)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Reto cancelado',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: { id: 'c1d2e3f4-a5b6-7890-cdef-012345678901', estado: 'cancelado' },
                  message: 'Challenge cancelled',
                },
              },
            },
          },
        },
      },
    },

    // ── Notifications ────────────────────────────────────
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Mis notificaciones',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: 'Lista paginada de notificaciones',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    notifications: [
                      {
                        id: 'n1b2c3d4-e5f6-7890-abcd-ef1234567890',
                        tipo: 'reto_recibido',
                        mensaje: '@NitroKing te ha lanzado un reto de cuarto milla!',
                        leida: false,
                        referencia_id: 'c1d2e3f4-a5b6-7890-cdef-012345678901',
                        created_at: '2025-05-01T14:00:00.000Z',
                      },
                    ],
                    total: 1,
                    page: 1,
                    limit: 20,
                  },
                  message: 'Notifications retrieved',
                },
              },
            },
          },
        },
      },
    },
    '/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Marcar todas como leídas',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Todas marcadas como leídas',
            content: {
              'application/json': {
                example: { success: true, data: null, message: 'All notifications marked as read' },
              },
            },
          },
        },
      },
    },
    '/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Marcar una notificación como leída',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Notificación marcada como leída',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: { id: 'n1b2c3d4-e5f6-7890-abcd-ef1234567890', leida: true },
                  message: 'Notification marked as read',
                },
              },
            },
          },
          403: { description: 'No es tu notificación' },
          404: { description: 'Notificación no encontrada' },
        },
      },
    },
  },
};
