const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Conexión a la base de datos exitosa.");
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function test() {
  const plainPassword = 'miPassword123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  console.log('Hashed password:', hashedPassword);

  const isValid = await bcrypt.compare(plainPassword, hashedPassword);
  console.log('Password es válido?', isValid);

  if (isValid) {
    const token = jwt.sign({ userId: '123', role: 'client' }, 'supersecreto', { expiresIn: '1h' });
    console.log('Token generado:', token);
  }
}

test();

main();