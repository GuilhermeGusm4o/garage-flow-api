import { PrismaClient } from '@generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const seedIds = {
  clients: [
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
  ],
  vehicles: [
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000014',
  ],
  inventory: [
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000022',
    '00000000-0000-0000-0000-000000000023',
    '00000000-0000-0000-0000-000000000024',
    '00000000-0000-0000-0000-000000000025',
    '00000000-0000-0000-0000-000000000026',
  ],
  services: [
    '00000000-0000-0000-0000-000000000031',
    '00000000-0000-0000-0000-000000000032',
    '00000000-0000-0000-0000-000000000033',
    '00000000-0000-0000-0000-000000000034',
    '00000000-0000-0000-0000-000000000035',
    '00000000-0000-0000-0000-000000000036',
  ],
  serviceOrders: [
    '00000000-0000-0000-0000-000000000041',
    '00000000-0000-0000-0000-000000000042',
    '00000000-0000-0000-0000-000000000043',
    '00000000-0000-0000-0000-000000000044',
    '00000000-0000-0000-0000-000000000045',
    '00000000-0000-0000-0000-000000000046',
    '00000000-0000-0000-0000-000000000047',
    '00000000-0000-0000-0000-000000000048',
  ],
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
    {
      id: seedIds.clients[2],
      cpfCnpj: '28984756001',
      name: 'Mariana Costa',
      address: 'Rua Augusta, 800 - Sao Paulo/SP',
      phone: '11988887777',
      email: 'mariana.costa@example.com',
    },
    {
      id: seedIds.clients[3],
      cpfCnpj: '43876512000190',
      name: 'Logistica Horizonte Ltda.',
      address: 'Rodovia Anhanguera, 1200 - Campinas/SP',
      phone: '1932221100',
      email: 'frota@horizonte.example.com',
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
    {
      id: seedIds.vehicles[2],
      brand: 'Chevrolet',
      model: 'Onix',
      licensePlate: 'QWE7R89',
      year: 2021,
      clientId: seedIds.clients[2],
    },
    {
      id: seedIds.vehicles[3],
      brand: 'Fiat',
      model: 'Toro',
      licensePlate: 'FGH2J34',
      year: 2023,
      clientId: seedIds.clients[3],
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
    {
      id: seedIds.inventory[2],
      name: 'Filtro de ar do motor',
      unitOfMeasure: 'UNIT',
      unitPrice: 48.9,
      quantity: 25,
    },
    {
      id: seedIds.inventory[3],
      name: 'Pastilha de freio dianteira',
      unitOfMeasure: 'UNIT',
      unitPrice: 189.9,
      quantity: 16,
    },
    {
      id: seedIds.inventory[4],
      name: 'Fluido de freio DOT 4',
      unitOfMeasure: 'ML',
      unitPrice: 32.5,
      quantity: 12000,
    },
    {
      id: seedIds.inventory[5],
      name: 'Bateria 60Ah',
      unitOfMeasure: 'UNIT',
      unitPrice: 489.9,
      quantity: 8,
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
    {
      id: seedIds.services[2],
      name: 'Diagnostico eletronico',
      price: 180,
    },
    {
      id: seedIds.services[3],
      name: 'Alinhamento e balanceamento',
      price: 220,
    },
    {
      id: seedIds.services[4],
      name: 'Troca de pastilhas de freio',
      price: 280,
    },
    {
      id: seedIds.services[5],
      name: 'Revisao do sistema de arrefecimento',
      price: 320,
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

  const mechanic = await prisma.user.findFirstOrThrow({
    where: { email: 'mechanic@example.com', deleted_at: null },
  });

  const serviceOrders = [
    {
      id: seedIds.serviceOrders[0],
      vehicleId: seedIds.vehicles[0],
      description: 'Cliente relata ruido no motor ao ligar o veiculo.',
      status: 'RECEIVED',
      mechanicId: null,
      approvedAt: null,
      services: [],
      parts: [],
    },
    {
      id: seedIds.serviceOrders[1],
      vehicleId: seedIds.vehicles[1],
      description: 'Luz de injecao acesa e perda de potencia.',
      status: 'IN_DIAGNOSIS',
      mechanicId: mechanic.id,
      approvedAt: null,
      services: [0, 2],
      parts: [0],
    },
    {
      id: seedIds.serviceOrders[2],
      vehicleId: seedIds.vehicles[2],
      description: 'Freios fazendo barulho e pedal com pouca resposta.',
      status: 'AWAITING_APPROVAL',
      mechanicId: mechanic.id,
      approvedAt: null,
      services: [4],
      parts: [3, 4],
    },
    {
      id: seedIds.serviceOrders[3],
      vehicleId: seedIds.vehicles[3],
      description: 'Revisao preventiva antes de viagem longa.',
      status: 'IN_EXECUTION',
      mechanicId: mechanic.id,
      approvedAt: new Date('2026-08-18T10:00:00.000Z'),
      services: [1],
      parts: [0, 1, 2],
    },
    {
      id: seedIds.serviceOrders[4],
      vehicleId: seedIds.vehicles[0],
      description: 'Troca de oleo e verificacao geral do veiculo.',
      status: 'IN_EXECUTION',
      mechanicId: mechanic.id,
      approvedAt: new Date('2026-08-19T14:30:00.000Z'),
      services: [0, 3],
      parts: [0, 1],
    },
    {
      id: seedIds.serviceOrders[5],
      vehicleId: seedIds.vehicles[1],
      description: 'Motor superaquecendo durante o uso urbano.',
      status: 'FINISHED',
      mechanicId: mechanic.id,
      approvedAt: new Date('2026-08-12T09:15:00.000Z'),
      services: [5],
      parts: [4],
    },
    {
      id: seedIds.serviceOrders[6],
      vehicleId: seedIds.vehicles[2],
      description: 'Servico concluido e entregue ao cliente.',
      status: 'DELIVERED',
      mechanicId: mechanic.id,
      approvedAt: new Date('2026-08-10T11:00:00.000Z'),
      services: [0, 2],
      parts: [0, 2],
    },
    {
      id: seedIds.serviceOrders[7],
      vehicleId: seedIds.vehicles[3],
      description: 'Cliente cancelou o servico antes da aprovacao.',
      status: 'CANCELED',
      mechanicId: null,
      approvedAt: null,
      services: [],
      parts: [],
    },
  ];

  for (const order of serviceOrders) {
    const selectedServices = order.services.map((index) => services[index]);
    const selectedParts = order.parts.map((index) => inventory[index]);
    const totalAmount =
      selectedServices.reduce((total, service) => total + service.price, 0) +
      selectedParts.reduce((total, part) => total + part.unitPrice, 0);

    await prisma.serviceOrder.upsert({
      where: { id: order.id },
      create: {
        id: order.id,
        vehicleId: order.vehicleId,
        description: order.description,
        mechanicId: order.mechanicId,
        status: order.status as any,
        approvedAt: order.approvedAt,
        totalAmount,
      },
      update: {
        vehicleId: order.vehicleId,
        description: order.description,
        mechanicId: order.mechanicId,
        status: order.status as any,
        approvedAt: order.approvedAt,
        totalAmount,
        deleted_at: null,
      },
    });

    await prisma.serviceOrderService.deleteMany({ where: { serviceOrderId: order.id } });
    await prisma.serviceOrderInventory.deleteMany({ where: { serviceOrderId: order.id } });

    if (selectedServices.length > 0) {
      await prisma.serviceOrderService.createMany({
        data: selectedServices.map((service) => ({
          serviceId: service.id,
          serviceOrderId: order.id,
          price: service.price,
        })),
      });
    }

    if (selectedParts.length > 0) {
      await prisma.serviceOrderInventory.createMany({
        data: selectedParts.map((part) => ({
          inventoryId: part.id,
          serviceOrderId: order.id,
          quantity: 1,
          unitPrice: part.unitPrice,
        })),
      });
    }
  }

  console.log('Seeded service orders across all workflow stages.');

  await prisma.$disconnect();
  console.log('Seeding finished.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
