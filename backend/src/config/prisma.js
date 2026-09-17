// Instância única do Prisma Client compartilhada por toda a aplicação.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
