// Handler central de erros: garante respostas padronizadas em toda a API.
const ApiError = require('../utils/ApiError');

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Erros conhecidos do Prisma (ex: violação de unique constraint)
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Já existe um registro com esses dados (violação de unicidade).' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Registro não encontrado.' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Erro interno do servidor' });
}

module.exports = errorHandler;
