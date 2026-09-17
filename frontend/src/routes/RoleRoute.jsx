import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Bloqueia acesso a usuários autenticados cujo perfil não está na lista permitida.
export default function RoleRoute({ allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/nao-autorizado" replace />;
  }
  return <Outlet />;
}
