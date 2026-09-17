const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard - estatísticas gerais para o painel administrativo
const getDashboard = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [
    totalClients,
    totalVets,
    totalPets,
    appointmentsToday,
    pendingAppointments,
    totalServices,
    products,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CLIENTE' } }),
    prisma.user.count({ where: { role: 'VETERINARIO' } }),
    prisma.pet.count(),
    prisma.appointment.count({ where: { date: { gte: startOfDay, lte: endOfDay } } }),
    prisma.appointment.count({ where: { status: 'PENDENTE' } }),
    prisma.service.count({ where: { active: true } }),
    prisma.inventoryProduct.findMany({ where: { active: true } }),
  ]);

  const lowStockCount = products.filter((p) => p.quantity < p.minQuantity).length;

  res.json({
    totalClients,
    totalVets,
    totalPets,
    appointmentsToday,
    pendingAppointments,
    totalServices,
    inventory: {
      totalProducts: products.length,
      lowStockCount,
    },
  });
});

module.exports = { getDashboard };
