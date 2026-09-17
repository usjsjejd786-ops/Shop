// Testes básicos de autenticação e autorização.
// Requer um banco de dados PostgreSQL de TESTE configurado em DATABASE_URL
// (ex: um schema/banco separado do de desenvolvimento) e migrations aplicadas.
//
// Rodar com: npm test (dentro da pasta backend)

const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');

const testEmail = `teste_${Date.now()}@petshop.com`;

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testEmail } });
  await prisma.$disconnect();
});

describe('Autenticação', () => {
  test('deve registrar um novo cliente', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Usuário Teste',
      email: testEmail,
      password: 'senha123',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('CLIENTE');
  });

  test('não deve registrar com email duplicado', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Usuário Teste 2',
      email: testEmail,
      password: 'senha123',
    });
    expect(res.status).toBe(409);
  });

  test('deve fazer login com credenciais corretas', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'senha123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('não deve fazer login com senha errada', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'senhaerrada',
    });
    expect(res.status).toBe(401);
  });

  test('não deve acessar rota protegida sem token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('não deve acessar rota de admin sendo cliente', async () => {
    const login = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'senha123',
    });
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(403);
  });
});
