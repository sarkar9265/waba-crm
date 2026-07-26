import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'sarkarmanoj319@gmail.com';
  
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log(`User ${email} not found.`);
    return;
  }
  
  await prisma.user.update({
    where: { email },
    data: { role: 'SUPER_ADMIN' }
  });
  
  console.log(`Successfully promoted ${email} to SUPER_ADMIN!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
