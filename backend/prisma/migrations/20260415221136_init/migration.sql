-- CreateEnum
CREATE TYPE "Rango" AS ENUM ('S', 'A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "TipoVehiculo" AS ENUM ('auto', 'moto', 'monopatin_electrico');

-- CreateEnum
CREATE TYPE "EstadoChallenge" AS ENUM ('pendiente', 'aceptado', 'rechazado', 'en_curso', 'completado', 'cancelado');

-- CreateEnum
CREATE TYPE "TipoCarrera" AS ENUM ('cuarto_milla', 'vueltas', 'derrape');

-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('activo', 'inactivo', 'suspendido');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('reto_recibido', 'reto_aceptado', 'reto_rechazado', 'resultado', 'rango_subido');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('piloto', 'administrador');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "foto_perfil" TEXT,
    "zona_localidad" TEXT,
    "zona_ciudad" TEXT,
    "zona_estado" TEXT,
    "zona_pais" TEXT,
    "rango" "Rango" NOT NULL DEFAULT 'D',
    "rol" "RolUsuario" NOT NULL DEFAULT 'piloto',
    "victorias" INTEGER NOT NULL DEFAULT 0,
    "derrotas" INTEGER NOT NULL DEFAULT 0,
    "retos_consecutivos" INTEGER NOT NULL DEFAULT 0,
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tipo_vehiculo" "TipoVehiculo" NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "color" TEXT,
    "placa" TEXT,
    "foto" TEXT,
    "modificaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "retador_id" TEXT NOT NULL,
    "retado_id" TEXT NOT NULL,
    "vehiculo_retador_id" TEXT NOT NULL,
    "vehiculo_retado_id" TEXT,
    "tipo_carrera" "TipoCarrera" NOT NULL,
    "estado" "EstadoChallenge" NOT NULL DEFAULT 'pendiente',
    "ganador_id" TEXT,
    "ubicacion_acordada" TEXT,
    "fecha_acordada" TIMESTAMP(3),
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "referencia_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_placa_key" ON "vehicles"("placa");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_retador_id_fkey" FOREIGN KEY ("retador_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_retado_id_fkey" FOREIGN KEY ("retado_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_ganador_id_fkey" FOREIGN KEY ("ganador_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_vehiculo_retador_id_fkey" FOREIGN KEY ("vehiculo_retador_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_vehiculo_retado_id_fkey" FOREIGN KEY ("vehiculo_retado_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
