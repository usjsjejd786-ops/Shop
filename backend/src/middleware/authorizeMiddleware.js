// Middleware de autorização por perfil (role).
// Uso: authorize('ADMINISTRADOR') ou authorize('ADMINISTRADOR', 'VETERINARIO')
const ApiError = require('../utils/ApiError');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Não autenticado'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Acesso negado: perfil sem permissão para esta ação'));
    }
    next();
  };
}

module.exports = authorize;
