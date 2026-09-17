const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

// POST /api/auth/register
// Registro público sempre cria um CLIENTE. Veterinários e administradores
// só podem ser criados por um administrador (via /api/users).
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Nome, email e senha são obrigatórios');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'A senha deve ter pelo menos 6 caracteres');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'Já existe uma conta com este email');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash, role: 'CLIENTE' },
  });

  const token = signToken({ id: user.id, role: user.role });
  res.status(201).json({ user: sanitizeUser(user), token });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Email e senha são obrigatórios');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    throw new ApiError(401, 'Email ou senha inválidos');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, 'Email ou senha inválidos');
  }

  const token = signToken({ id: user.id, role: user.role });
  res.json({ user: sanitizeUser(user), token });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new ApiError(404, 'Usuário não encontrado');
  res.json(sanitizeUser(user));
});

// PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Informe a senha atual e a nova senha');
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, 'A nova senha deve ter pelo menos 6 caracteres');
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Senha atual incorreta');

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  res.json({ message: 'Senha alterada com sucesso' });
});

// PUT /api/auth/profile - editar os próprios dados
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, phone },
  });
  res.json(sanitizeUser(user));
});

// POST /api/auth/forgot-password
// Simplificação para projeto acadêmico: gera um token de redefinição e
// "envia" retornando na resposta (em produção seria enviado por email).
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Não revela se o email existe ou não, por segurança.
    return res.json({ message: 'Se o email existir, um link de redefinição será enviado.' });
  }
  const resetToken = signToken({ id: user.id, purpose: 'reset' });
  res.json({
    message: 'Token de redefinição gerado (em produção seria enviado por email).',
    resetToken,
  });
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  const { verifyToken } = require('../utils/jwt');
  let decoded;
  try {
    decoded = verifyToken(resetToken);
  } catch {
    throw new ApiError(400, 'Token de redefinição inválido ou expirado');
  }
  if (decoded.purpose !== 'reset') throw new ApiError(400, 'Token inválido');

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: decoded.id }, data: { passwordHash } });
  res.json({ message: 'Senha redefinida com sucesso' });
});

module.exports = {
  register,
  login,
  me,
  changePassword,
  updateProfile,
  forgotPassword,
  resetPassword,
  sanitizeUser,
};
