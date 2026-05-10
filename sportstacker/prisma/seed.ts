import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@sportstacker.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@sportstacker.com',
      password: hashedPassword,
      role: 'SUPERADMIN',
    },
  });

  console.log('SuperAdmin created:', superAdmin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });