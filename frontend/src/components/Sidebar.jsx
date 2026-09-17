import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MENUS = {
  CLIENTE: [
    { to: '/cliente', label: 'Início', end: true },
    { to: '/cliente/pets', label: 'Meus Pets' },
    { to: '/cliente/agendamentos', label: 'Agendamentos' },
    { to: '/cliente/servicos', label: 'Serviços' },
    { to: '/cliente/perfil', label: 'Meu Perfil' },
  ],
  VETERINARIO: [
    { to: '/vet', label: 'Início', end: true },
    { to: '/vet/agenda', label: 'Agenda do Dia' },
    { to: '/vet/consultas', label: 'Minhas Consultas' },
    { to: '/vet/perfil', label: 'Meu Perfil' },
  ],
  ADMINISTRADOR: [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/usuarios', label: 'Usuários' },
    { to: '/admin/veterinarios', label: 'Veterinários' },
    { to: '/admin/pets', label: 'Pets' },
    { to: '/admin/servicos', label: 'Serviços' },
    { to: '/admin/agendamentos', label: 'Agendamentos' },
    { to: '/admin/agenda', label: 'Agenda do Dia' },
    { to: '/admin/estoque', label: 'Estoque' },
    { to: '/admin/perfil', label: 'Meu Perfil' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const items = MENUS[user?.role] || [];

  return (
    <div className="sidebar">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}
