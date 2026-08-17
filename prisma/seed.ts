import { PrismaClient } from '@generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

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
    await prisma.user.upsert({
      where: { email: r.email },
      update: {
        name: r.name,
        passwordHash,
        role: r.role as any,
        deleted_at: null,
      },
      create: {
        id: randomUUID(),
        name: r.name,
        email: r.email,
        passwordHash,
        role: r.role as any,
      },
    });
  }

  await prisma.$disconnect();
  console.log('Seeding finished.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
