const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sanitizeUser } = require('./authController');

// GET /api/users - lista/pesquisa usuários (admin)
const listUsers = asyncHandler(async (req, res) => {
  const { search, role } = req.query;
  const where = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  const users = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(users.map(sanitizeUser));
});

// GET /api/users/:id
const getUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new ApiError(404, 'Usuário não encontrado');
  res.json(sanitizeUser(user));
});

// POST /api/users - admin cria usuário de qualquer tipo (ex: veterinário)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, specialty, licenseNumber } = req.body;
  if (!name || !email || !password || !role) {
    throw new ApiError(400, 'Nome, email, senha e perfil são obrigatórios');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'Já existe uma conta com este email');

  const passwordHash = await bcrypt.hash(password, 10);
  const data = { name, email, phone, passwordHash, role };

  if (role === 'VETERINARIO') {
    data.veterinarianProfile = { create: { specialty, licenseNumber } };
  }

  const user = await prisma.user.create({ data });
  res.status(201).json(sanitizeUser(user));
});

// PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { name, phone, role, active } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { name, phone, role, active },
  });
  res.json(sanitizeUser(user));
});

// DELETE /api/users/:id - desativa (soft delete) em vez de apagar
const deleteUser = asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.params.id }, data: { active: false } });
  res.json({ message: 'Usuário desativado com sucesso' });
});

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
