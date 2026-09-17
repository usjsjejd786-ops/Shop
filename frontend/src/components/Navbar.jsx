import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="navbar">
      <div className="brand">🐾 PetShop &amp; Veterinária</div>
      <div className="user-info">
        <span>{user?.name} <span className="text-muted">({roleLabel(user?.role)})</span></span>
        <Button variant="secondary" size="sm" onClick={handleLogout}>Sair</Button>
      </div>
    </div>
  );
}

function roleLabel(role) {
  return { CLIENTE: 'Cliente', VETERINARIO: 'Veterinário', ADMINISTRADOR: 'Administrador' }[role] || role;
}
