require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'dpenuelaruiz7@gmail.com';
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('aaaaaa', 10);
    const user = await prisma.user.create({
      data: {
        nombre: 'Admin',
        email,
        password: hashedPassword,
      },
    });
    console.log('Seed user created:', user.email);
  } else {
    console.log('Seed user already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
