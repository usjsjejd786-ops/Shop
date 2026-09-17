import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, dashboardPathForRole } from './context/AuthContext';

import PrivateRoute from './routes/PrivateRoute';
import RoleRoute from './routes/RoleRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import PetMedicalRecord from './pages/PetMedicalRecord';
import NotAuthorized from './pages/NotAuthorized';
import NotFound from './pages/NotFound';

import ClientDashboard from './pages/ClientDashboard';
import Pets from './pages/Pets';
import Appointments from './pages/Appointments';
import Services from './pages/Services';

import VetDashboard from './pages/VetDashboard';
import VetAgenda from './pages/VetAgenda';
import VetConsultations from './pages/VetConsultations';

import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminVeterinarians from './pages/AdminVeterinarians';
import AdminAgenda from './pages/AdminAgenda';
import Inventory from './pages/Inventory';

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={dashboardPathForRole(user.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/esqueci-senha" element={<ForgotPassword />} />
      <Route path="/nao-autorizado" element={<NotAuthorized />} />

      <Route element={<PrivateRoute />}>
        {/* Rotas compartilhadas entre os três perfis */}
        <Route path="/pets/:id/prontuario" element={<PetMedicalRecord />} />

        {/* Cliente */}
        <Route element={<RoleRoute allowedRoles={['CLIENTE']} />}>
          <Route path="/cliente" element={<ClientDashboard />} />
          <Route path="/cliente/pets" element={<Pets />} />
          <Route path="/cliente/agendamentos" element={<Appointments />} />
          <Route path="/cliente/servicos" element={<Services />} />
          <Route path="/cliente/perfil" element={<Profile />} />
        </Route>

        {/* Veterinário */}
        <Route element={<RoleRoute allowedRoles={['VETERINARIO']} />}>
          <Route path="/vet" element={<VetDashboard />} />
          <Route path="/vet/agenda" element={<VetAgenda />} />
          <Route path="/vet/consultas" element={<VetConsultations />} />
          <Route path="/vet/perfil" element={<Profile />} />
        </Route>

        {/* Administrador */}
        <Route element={<RoleRoute allowedRoles={['ADMINISTRADOR']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/usuarios" element={<AdminUsers />} />
          <Route path="/admin/veterinarios" element={<AdminVeterinarians />} />
          <Route path="/admin/pets" element={<Pets />} />
          <Route path="/admin/servicos" element={<Services />} />
          <Route path="/admin/agendamentos" element={<Appointments />} />
          <Route path="/admin/agenda" element={<AdminAgenda />} />
          <Route path="/admin/estoque" element={<Inventory />} />
          <Route path="/admin/perfil" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
