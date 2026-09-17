const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Regra: cliente só vê/edita os próprios pets. Admin e veterinário veem todos.
function buildScope(req) {
  if (req.user.role === 'CLIENTE') return { ownerId: req.user.id };
  return {};
}

// GET /api/pets
const listPets = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const where = { ...buildScope(req) };
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const pets = await prisma.pet.findMany({
    where,
    include: { owner: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(pets);
});

// GET /api/pets/:id
const getPet = asyncHandler(async (req, res) => {
  const pet = await prisma.pet.findUnique({
    where: { id: req.params.id },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });
  if (!pet) throw new ApiError(404, 'Pet não encontrado');
  if (req.user.role === 'CLIENTE' && pet.ownerId !== req.user.id) {
    throw new ApiError(403, 'Você não tem acesso a este pet');
  }
  res.json(pet);
});

// POST /api/pets
const createPet = asyncHandler(async (req, res) => {
  const { name, species, breed, sex, birthDate, weight, notes, ownerId } = req.body;
  if (!name || !species) throw new ApiError(400, 'Nome e espécie são obrigatórios');

  // Cliente só pode cadastrar pet para si mesmo; admin pode indicar o dono.
  const finalOwnerId = req.user.role === 'CLIENTE' ? req.user.id : (ownerId || req.user.id);

  const pet = await prisma.pet.create({
    data: {
      name,
      species,
      breed,
      sex,
      birthDate: birthDate ? new Date(birthDate) : null,
      weight: weight ? Number(weight) : null,
      notes,
      ownerId: finalOwnerId,
    },
  });
  res.status(201).json(pet);
});

// PUT /api/pets/:id
const updatePet = asyncHandler(async (req, res) => {
  const existing = await prisma.pet.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Pet não encontrado');
  if (req.user.role === 'CLIENTE' && existing.ownerId !== req.user.id) {
    throw new ApiError(403, 'Você não tem acesso a este pet');
  }

  const { name, species, breed, sex, birthDate, weight, notes } = req.body;
  const pet = await prisma.pet.update({
    where: { id: req.params.id },
    data: {
      name,
      species,
      breed,
      sex,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      weight: weight !== undefined ? Number(weight) : undefined,
      notes,
    },
  });
  res.json(pet);
});

// DELETE /api/pets/:id
const deletePet = asyncHandler(async (req, res) => {
  const existing = await prisma.pet.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Pet não encontrado');
  if (req.user.role === 'CLIENTE' && existing.ownerId !== req.user.id) {
    throw new ApiError(403, 'Você não tem acesso a este pet');
  }
  await prisma.pet.delete({ where: { id: req.params.id } });
  res.json({ message: 'Pet excluído com sucesso' });
});

// GET /api/pets/:id/medical-records
const getPetMedicalRecords = asyncHandler(async (req, res) => {
  const pet = await prisma.pet.findUnique({ where: { id: req.params.id } });
  if (!pet) throw new ApiError(404, 'Pet não encontrado');
  if (req.user.role === 'CLIENTE' && pet.ownerId !== req.user.id) {
    throw new ApiError(403, 'Você não tem acesso ao prontuário deste pet');
  }

  const records = await prisma.medicalRecord.findMany({
    where: { petId: req.params.id },
    include: { veterinarian: { select: { id: true, name: true } } },
    orderBy: { date: 'desc' },
  });
  res.json(records);
});

// POST /api/pets/:id/medical-records - somente veterinário
const createPetMedicalRecord = asyncHandler(async (req, res) => {
  const pet = await prisma.pet.findUnique({ where: { id: req.params.id } });
  if (!pet) throw new ApiError(404, 'Pet não encontrado');

  const { diagnosis, observations, treatment, appointmentId } = req.body;
  const record = await prisma.medicalRecord.create({
    data: {
      petId: pet.id,
      veterinarianId: req.user.id,
      diagnosis,
      observations,
      treatment,
      appointmentId: appointmentId || null,
    },
  });

  if (appointmentId) {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CONCLUIDO' },
    });
  }

  res.status(201).json(record);
});

module.exports = {
  listPets,
  getPet,
  createPet,
  updatePet,
  deletePet,
  getPetMedicalRecords,
  createPetMedicalRecord,
};
