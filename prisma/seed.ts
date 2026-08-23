import { PrismaClient } from '@generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const seedIds = {
  clients: ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'],
  vehicles: ['00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000012'],
  inventory: ['00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000022'],
  services: ['00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000032'],
};

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new (PrismaClient as any)({ adapter });

  const password = 'Password123!';
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const roles = [
    { role: 'ADMIN', email: 'admin@example.com', name: 'Admin' },
    { role: 'MECHANIC', email: 'mechanic@example.com', name: 'Mechanic' },
    { role: 'SERVICE_ADVISOR', email: 'advisor@example.com', name: 'Service Advisor' },
    { role: 'STOCK_CLERK', email: 'stock@example.com', name: 'Stock Clerk' },
  ];

  for (const r of roles) {
    console.log(`Seeding user ${r.email} (${r.role})`);
    const existingUser = await prisma.user.findFirst({
      where: { email: r.email, deleted_at: null },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: r.name,
          passwordHash,
          role: r.role as any,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          name: r.name,
          email: r.email,
          passwordHash,
          role: r.role as any,
        },
      });
    }
  }

  const clients = [
    {
      id: seedIds.clients[0],
      cpfCnpj: '52998224725',
      name: 'Joao da Silva',
      address: 'Rua das Flores, 123 - Sao Paulo/SP',
      phone: '11999998888',
      email: 'joao.silva@example.com',
    },
    {
      id: seedIds.clients[1],
      cpfCnpj: '11222333000181',
      name: 'Transportadora Boa Rota Ltda.',
      address: 'Avenida Brasil, 500 - Sao Paulo/SP',
      phone: '1133334444',
      email: 'contato@boarota.example.com',
    },
  ];

  for (const client of clients) {
    await prisma.client.upsert({
      where: { id: client.id },
      create: client,
      update: client,
    });
  }

  const vehicles = [
    {
      id: seedIds.vehicles[0],
      brand: 'Volkswagen',
      model: 'Gol',
      licensePlate: 'ABC1D23',
      year: 2020,
      clientId: seedIds.clients[0],
    },
    {
      id: seedIds.vehicles[1],
      brand: 'Toyota',
      model: 'Corolla',
      licensePlate: 'XYZ4E56',
      year: 2022,
      clientId: seedIds.clients[1],
    },
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.upsert({
      where: { id: vehicle.id },
      create: vehicle,
      update: vehicle,
    });
  }

  const inventory = [
    {
      id: seedIds.inventory[0],
      name: 'Oleo sintetico 5W40',
      unitOfMeasure: 'ML',
      unitPrice: 59.9,
      quantity: 25000,
    },
    {
      id: seedIds.inventory[1],
      name: 'Filtro de oleo',
      unitOfMeasure: 'UNIT',
      unitPrice: 35.5,
      quantity: 30,
    },
  ];

  for (const part of inventory) {
    await prisma.inventory.upsert({
      where: { id: part.id },
      create: part,
      update: part,
    });
  }

  const services = [
    {
      id: seedIds.services[0],
      name: 'Troca de oleo',
      price: 150,
    },
    {
      id: seedIds.services[1],
      name: 'Revisao completa',
      price: 450,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      create: service,
      update: service,
    });
  }

  console.log('Seeded clients, vehicles, inventory, and services.');

  await prisma.$disconnect();
  console.log('Seeding finished.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
