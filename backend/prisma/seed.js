// Popula o banco com dados básicos para testes/desenvolvimento.
// Execute com: npm run seed (dentro da pasta backend)

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const TEST_PASSWORD = 'senha123'; // Apenas para ambiente de desenvolvimento!

async function main() {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@petshop.com' },
    update: {},
    create: {
      name: 'Administrador Geral',
      email: 'admin@petshop.com',
      passwordHash,
      role: 'ADMINISTRADOR',
    },
  });

  const vet = await prisma.user.upsert({
    where: { email: 'veterinario@petshop.com' },
    update: {},
    create: {
      name: 'Dra. Ana Veterinária',
      email: 'veterinario@petshop.com',
      passwordHash,
      role: 'VETERINARIO',
      veterinarianProfile: {
        create: {
          specialty: 'Clínica Geral',
          licenseNumber: 'CRMV-1234',
        },
      },
    },
  });

  const client = await prisma.user.upsert({
    where: { email: 'cliente@petshop.com' },
    update: {},
    create: {
      name: 'João Cliente',
      email: 'cliente@petshop.com',
      passwordHash,
      role: 'CLIENTE',
    },
  });

  const pet = await prisma.pet.upsert({
    where: { id: 'seed-pet-rex' },
    update: {},
    create: {
      id: 'seed-pet-rex',
      name: 'Rex',
      species: 'Cachorro',
      breed: 'Vira-lata',
      sex: 'Macho',
      weight: 12.5,
      ownerId: client.id,
    },
  });

  const service = await prisma.service.upsert({
    where: { id: 'seed-service-consulta' },
    update: {},
    create: {
      id: 'seed-service-consulta',
      name: 'Consulta Veterinária',
      description: 'Consulta clínica geral',
      price: 120.0,
      duration: 30,
    },
  });

  await prisma.service.upsert({
    where: { id: 'seed-service-banho' },
    update: {},
    create: {
      id: 'seed-service-banho',
      name: 'Banho',
      description: 'Banho completo com secagem',
      price: 60.0,
      duration: 45,
    },
  });

  await prisma.inventoryProduct.upsert({
    where: { id: 'seed-product-racao' },
    update: {},
    create: {
      id: 'seed-product-racao',
      name: 'Ração Premium 10kg',
      category: 'Alimentação',
      quantity: 15,
      minQuantity: 5,
      price: 180.0,
      description: 'Ração premium para cães adultos',
    },
  });

  console.log('Seed concluído.');
  console.log('Usuários de teste (senha para todos: "senha123"):');
  console.log('- Admin:', admin.email);
  console.log('- Veterinário:', vet.email);
  console.log('- Cliente:', client.email);
  console.log('Pet de exemplo:', pet.name, '| Serviço de exemplo:', service.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
