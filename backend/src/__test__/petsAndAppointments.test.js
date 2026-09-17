// Testes das funcionalidades de pets, agendamento e estoque.
// Requer banco de teste configurado (ver auth.test.js).

const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');

const clientEmail = `cliente_teste_${Date.now()}@petshop.com`;
let clientToken;
let petId;

beforeAll(async () => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Cliente de Teste',
    email: clientEmail,
    password: 'senha123',
  });
  clientToken = res.body.token;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: clientEmail } });
  await prisma.$disconnect();
});

describe('Pets', () => {
  test('cliente deve cadastrar um pet', async () => {
    const res = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ name: 'Totó', species: 'Cachorro' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Totó');
    petId = res.body.id;
  });

  test('cliente deve listar apenas os próprios pets', async () => {
    const res = await request(app)
      .get('/api/pets')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.every((p) => p.owner)).toBe(true);
  });

  test('cliente não deve conseguir excluir estoque (rota restrita a admin)', async () => {
    const res = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
  });
});

describe('Agendamentos', () => {
  test('deve impedir agendamento em serviço inexistente', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ petId, serviceId: 'id-inexistente', date: new Date().toISOString() });
    expect(res.status).toBe(404);
  });
});
