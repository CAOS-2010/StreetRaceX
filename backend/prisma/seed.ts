// Seed file — populates the database with realistic test data
// Run: npm run seed

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding StreetRaceX database...');

  // Clear existing data (order matters for FK constraints)
  await prisma.notification.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // ── Users ────────────────────────────────────────────
  const [admin, speedmaster, nitro, drifter, rookie] = await Promise.all([
    prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@streetracex.com',
        password_hash: await hash('admin123'),
        rango: 'S',
        rol: 'administrador',
        victorias: 50,
        derrotas: 5,
        retos_consecutivos: 0,
        zona_ciudad: 'Bogotá',
        zona_pais: 'Colombia',
        estado: 'activo',
      },
    }),
    prisma.user.create({
      data: {
        username: 'SpeedMaster',
        email: 'speed@race.com',
        password_hash: await hash('password123'),
        rango: 'B',
        victorias: 12,
        derrotas: 4,
        retos_consecutivos: 1,
        zona_ciudad: 'Bogotá',
        zona_pais: 'Colombia',
        estado: 'activo',
      },
    }),
    prisma.user.create({
      data: {
        username: 'NitroKing',
        email: 'nitro@race.com',
        password_hash: await hash('password123'),
        rango: 'B',
        victorias: 8,
        derrotas: 6,
        retos_consecutivos: 0,
        zona_ciudad: 'Bogotá',
        zona_pais: 'Colombia',
        estado: 'activo',
      },
    }),
    prisma.user.create({
      data: {
        username: 'DriftQueen',
        email: 'drift@race.com',
        password_hash: await hash('password123'),
        rango: 'A',
        victorias: 25,
        derrotas: 8,
        retos_consecutivos: 1,
        zona_ciudad: 'Medellín',
        zona_pais: 'Colombia',
        estado: 'activo',
      },
    }),
    prisma.user.create({
      data: {
        username: 'Rookie99',
        email: 'rookie@race.com',
        password_hash: await hash('password123'),
        rango: 'D',
        victorias: 1,
        derrotas: 3,
        retos_consecutivos: 1,
        zona_ciudad: 'Bogotá',
        zona_pais: 'Colombia',
        estado: 'activo',
      },
    }),
  ]);

  console.log('✅ Users created');

  // ── Vehicles ─────────────────────────────────────────
  const [supra, civic, ninja, gsxr] = await Promise.all([
    prisma.vehicle.create({
      data: {
        user_id: speedmaster.id,
        tipo_vehiculo: 'auto',
        marca: 'Toyota',
        modelo: 'Supra MK4',
        anio:1998,
        color: 'Blanco',
        placa: 'ABC-123',
        activo: true,
        modificaciones: 'Motor 2JZ-GTE, turbo HKS GT2835, intercooler frontal',
      },
    }),
    prisma.vehicle.create({
      data: {
        user_id: nitro.id,
        tipo_vehiculo: 'auto',
        marca: 'Honda',
        modelo: 'Civic Type R',
        anio:2023,
        color: 'Rojo',
        placa: 'XYZ-789',
        activo: true,
        modificaciones: 'Stage 2 tune, downpipe aftermarket',
      },
    }),
    prisma.vehicle.create({
      data: {
        user_id: drifter.id,
        tipo_vehiculo: 'moto',
        marca: 'Kawasaki',
        modelo: 'Ninja ZX-10R',
        anio:2022,
        color: 'Verde',
        placa: 'MOT-456',
        activo: true,
        modificaciones: 'Akrapovic exhaust, ECU flash',
      },
    }),
    prisma.vehicle.create({
      data: {
        user_id: rookie.id,
        tipo_vehiculo: 'moto',
        marca: 'Suzuki',
        modelo: 'GSX-R600',
        anio:2019,
        color: 'Azul',
        placa: 'MOT-999',
        activo: true,
      },
    }),
  ]);

  // Admin gets a car too
  await prisma.vehicle.create({
    data: {
      user_id: admin.id,
      tipo_vehiculo: 'auto',
      marca: 'Nissan',
      modelo: 'GT-R R35',
      anio: 2020,
      color: 'Gris',
      placa: 'ADM-001',
      activo: true,
      modificaciones: 'Full race build — 1000hp',
    },
  });

  console.log('✅ Vehicles created');

  // ── A sample challenge ────────────────────────────────
  await prisma.challenge.create({
    data: {
      retador_id: speedmaster.id,
      retado_id: nitro.id,
      vehiculo_retador_id: supra.id,
      vehiculo_retado_id: civic.id,
      tipo_carrera: 'cuarto_milla',
      estado: 'pendiente',
      ubicacion_acordada: 'Aeropuerto Eldorado, Bogotá',
      notas: 'Primer reto de la temporada!',
    },
  });

  console.log('✅ Sample challenge created');
  console.log('\n🏁 Seed completed successfully!');
  console.log('\n📋 Test credentials:');
  console.log('   admin@streetracex.com  / admin123   (Rango S)');
  console.log('   speed@race.com         / password123 (Rango B)');
  console.log('   nitro@race.com         / password123 (Rango B)');
  console.log('   drift@race.com         / password123 (Rango A)');
  console.log('   rookie@race.com        / password123 (Rango D)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
