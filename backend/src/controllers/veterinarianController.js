const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sanitizeUser } = require('./authController');

// GET /api/veterinarians
const listVeterinarians = asyncHandler(async (req, res) => {
  const vets = await prisma.user.findMany({
    where: { role: 'VETERINARIO' },
    include: { veterinarianProfile: true },
    orderBy: { name: 'asc' },
  });
  res.json(vets.map((v) => ({ ...sanitizeUser(v), veterinarianProfile: v.veterinarianProfile })));
});

// POST /api/veterinarians - admin cadastra veterinário
const createVeterinarian = asyncHandler(async (req, res) => {
  const { name, email, password, phone, specialty, licenseNumber } = req.body;
  if (!name || !email || !password) throw new ApiError(400, 'Nome, email e senha são obrigatórios');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'Já existe uma conta com este email');

  const passwordHash = await bcrypt.hash(password, 10);
  const vet = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: 'VETERINARIO',
      veterinarianProfile: { create: { specialty, licenseNumber } },
    },
    include: { veterinarianProfile: true },
  });
  res.status(201).json({ ...sanitizeUser(vet), veterinarianProfile: vet.veterinarianProfile });
});

// PUT /api/veterinarians/:id
const updateVeterinarian = asyncHandler(async (req, res) => {
  const { name, phone, active, specialty, licenseNumber } = req.body;
  const vet = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      name,
      phone,
      active,
      veterinarianProfile: {
        upsert: {
          create: { specialty, licenseNumber },
          update: { specialty, licenseNumber },
        },
      },
    },
    include: { veterinarianProfile: true },
  });
  res.json({ ...sanitizeUser(vet), veterinarianProfile: vet.veterinarianProfile });
});

// GET /api/veterinarians/:id/agenda - visualizar agenda de um veterinário (admin)
const getVeterinarianAgenda = asyncHandler(async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    where: { veterinarianId: req.params.id },
    include: {
      client: { select: { id: true, name: true } },
      pet: { select: { id: true, name: true } },
      service: { select: { id: true, name: true } },
    },
    orderBy: { date: 'asc' },
  });
  res.json(appointments);
});

module.exports = { listVeterinarians, createVeterinarian, updateVeterinarian, getVeterinarianAgenda };
