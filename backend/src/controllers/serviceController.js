const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/services
// Clientes só devem ver serviços ativos; admin/vet veem todos.
const listServices = asyncHandler(async (req, res) => {
  const where = req.user.role === 'CLIENTE' ? { active: true } : {};
  const services = await prisma.service.findMany({ where, orderBy: { name: 'asc' } });
  res.json(services);
});

// GET /api/services/:id
const getService = asyncHandler(async (req, res) => {
  const service = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!service) throw new ApiError(404, 'Serviço não encontrado');
  res.json(service);
});

// POST /api/services
const createService = asyncHandler(async (req, res) => {
  const { name, description, price, duration } = req.body;
  if (!name || price === undefined || !duration) {
    throw new ApiError(400, 'Nome, preço e duração são obrigatórios');
  }
  const service = await prisma.service.create({
    data: { name, description, price: Number(price), duration: Number(duration) },
  });
  res.status(201).json(service);
});

// PUT /api/services/:id
const updateService = asyncHandler(async (req, res) => {
  const { name, description, price, duration, active } = req.body;
  const service = await prisma.service.update({
    where: { id: req.params.id },
    data: {
      name,
      description,
      price: price !== undefined ? Number(price) : undefined,
      duration: duration !== undefined ? Number(duration) : undefined,
      active,
    },
  });
  res.json(service);
});

// DELETE /api/services/:id - desativa em vez de apagar (preserva histórico de agendamentos)
const deleteService = asyncHandler(async (req, res) => {
  await prisma.service.update({ where: { id: req.params.id }, data: { active: false } });
  res.json({ message: 'Serviço desativado com sucesso' });
});

module.exports = { listServices, getService, createService, updateService, deleteService };
