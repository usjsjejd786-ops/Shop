const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const INCLUDE = {
  client: { select: { id: true, name: true, email: true } },
  pet: { select: { id: true, name: true, species: true } },
  veterinarian: { select: { id: true, name: true } },
  service: { select: { id: true, name: true, price: true, duration: true } },
};

function buildScope(req) {
  if (req.user.role === 'CLIENTE') return { clientId: req.user.id };
  if (req.user.role === 'VETERINARIO') return { veterinarianId: req.user.id };
  return {}; // administrador vê tudo
}

// Verifica se já existe agendamento ativo para o mesmo veterinário no mesmo horário.
async function hasConflict({ veterinarianId, date, serviceDurationMinutes, excludeId }) {
  if (!veterinarianId) return false;

  const start = new Date(date);
  const end = new Date(start.getTime() + serviceDurationMinutes * 60000);

  const candidates = await prisma.appointment.findMany({
    where: {
      veterinarianId,
      status: { in: ['PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO'] },
      id: excludeId ? { not: excludeId } : undefined,
    },
    include: { service: true },
  });

  return candidates.some((appt) => {
    const apptStart = new Date(appt.date);
    const apptEnd = new Date(apptStart.getTime() + (appt.service?.duration || 30) * 60000);
    return start < apptEnd && apptStart < end; // sobreposição de intervalos
  });
}

// GET /api/appointments  (suporta filtros: date, veterinarianId, clientId, status)
const listAppointments = asyncHandler(async (req, res) => {
  const { date, veterinarianId, clientId, status } = req.query;
  const where = { ...buildScope(req) };

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.date = { gte: start, lte: end };
  }
  // Admin pode filtrar adicionalmente por veterinário/cliente/status
  if (req.user.role === 'ADMINISTRADOR') {
    if (veterinarianId) where.veterinarianId = veterinarianId;
    if (clientId) where.clientId = clientId;
  }
  if (status) where.status = status;

  const appointments = await prisma.appointment.findMany({
    where,
    include: INCLUDE,
    orderBy: { date: 'asc' },
  });
  res.json(appointments);
});

// GET /api/appointments/:id
const getAppointment = asyncHandler(async (req, res) => {
  const appt = await prisma.appointment.findUnique({ where: { id: req.params.id }, include: INCLUDE });
  if (!appt) throw new ApiError(404, 'Agendamento não encontrado');

  if (req.user.role === 'CLIENTE' && appt.clientId !== req.user.id) {
    throw new ApiError(403, 'Acesso negado a este agendamento');
  }
  if (req.user.role === 'VETERINARIO' && appt.veterinarianId !== req.user.id) {
    throw new ApiError(403, 'Acesso negado a este agendamento');
  }
  res.json(appt);
});

// POST /api/appointments
const createAppointment = asyncHandler(async (req, res) => {
  const { petId, serviceId, veterinarianId, date, clientId, notes } = req.body;
  if (!petId || !serviceId || !date) {
    throw new ApiError(400, 'Pet, serviço e data/horário são obrigatórios');
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new ApiError(404, 'Serviço não encontrado');
  if (!service.active) throw new ApiError(400, 'Não é possível agendar um serviço inativo');

  if (veterinarianId) {
    const vet = await prisma.user.findUnique({ where: { id: veterinarianId } });
    if (!vet || vet.role !== 'VETERINARIO') throw new ApiError(400, 'Veterinário inválido');
    if (!vet.active) throw new ApiError(400, 'Não é possível agendar com um veterinário inativo');
  }

  // Cliente só agenda para si mesmo; admin pode agendar em nome de qualquer cliente.
  const finalClientId = req.user.role === 'CLIENTE' ? req.user.id : (clientId || req.user.id);

  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet) throw new ApiError(404, 'Pet não encontrado');
  if (req.user.role === 'CLIENTE' && pet.ownerId !== req.user.id) {
    throw new ApiError(403, 'Você só pode agendar para os seus próprios pets');
  }

  const conflict = await hasConflict({
    veterinarianId,
    date,
    serviceDurationMinutes: service.duration,
  });
  if (conflict) {
    throw new ApiError(409, 'Já existe um agendamento para este veterinário neste horário');
  }

  const appointment = await prisma.appointment.create({
    data: {
      clientId: finalClientId,
      petId,
      serviceId,
      veterinarianId: veterinarianId || null,
      date: new Date(date),
      notes,
      status: 'PENDENTE',
    },
    include: INCLUDE,
  });
  res.status(201).json(appointment);
});

// PUT /api/appointments/:id  (edição geral / reagendamento / alteração de status)
const updateAppointment = asyncHandler(async (req, res) => {
  const existing = await prisma.appointment.findUnique({ where: { id: req.params.id }, include: { service: true } });
  if (!existing) throw new ApiError(404, 'Agendamento não encontrado');

  if (req.user.role === 'CLIENTE' && existing.clientId !== req.user.id) {
    throw new ApiError(403, 'Acesso negado a este agendamento');
  }
  if (req.user.role === 'VETERINARIO' && existing.veterinarianId !== req.user.id) {
    throw new ApiError(403, 'Acesso negado a este agendamento');
  }

  const { date, veterinarianId, serviceId, status, notes } = req.body;

  // Cliente só pode reagendar/cancelar; não pode mudar status arbitrariamente (ex: concluído).
  if (req.user.role === 'CLIENTE' && status && !['CANCELADO'].includes(status)) {
    throw new ApiError(403, 'Cliente só pode cancelar um agendamento');
  }

  const newDate = date ? new Date(date) : existing.date;
  const newVetId = veterinarianId !== undefined ? veterinarianId : existing.veterinarianId;
  const newServiceId = serviceId || existing.serviceId;

  if (date || veterinarianId || serviceId) {
    const service = await prisma.service.findUnique({ where: { id: newServiceId } });
    const conflict = await hasConflict({
      veterinarianId: newVetId,
      date: newDate,
      serviceDurationMinutes: service.duration,
      excludeId: existing.id,
    });
    if (conflict) throw new ApiError(409, 'Já existe um agendamento para este veterinário neste horário');
  }

  const appointment = await prisma.appointment.update({
    where: { id: req.params.id },
    data: {
      date: newDate,
      veterinarianId: newVetId,
      serviceId: newServiceId,
      status,
      notes,
    },
    include: INCLUDE,
  });
  res.json(appointment);
});

// DELETE /api/appointments/:id -> cancela (não apaga, preserva histórico)
const cancelAppointment = asyncHandler(async (req, res) => {
  const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Agendamento não encontrado');
  if (req.user.role === 'CLIENTE' && existing.clientId !== req.user.id) {
    throw new ApiError(403, 'Acesso negado a este agendamento');
  }
  const appointment = await prisma.appointment.update({
    where: { id: req.params.id },
    data: { status: 'CANCELADO' },
  });
  res.json(appointment);
});

module.exports = {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
};
