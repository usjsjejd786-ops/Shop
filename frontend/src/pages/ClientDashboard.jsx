import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import Card from '../components/Card';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/pets'), api.get('/appointments')])
      .then(([petsRes, apptRes]) => {
        setPets(petsRes.data);
        setAppointments(apptRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Loading /></Layout>;

  const upcoming = appointments
    .filter((a) => ['PENDENTE', 'CONFIRMADO'].includes(a.status))
    .slice(0, 5);

  return (
    <Layout>
      <h1 className="page-title">Olá, {user.name.split(' ')[0]} 👋</h1>
      <p className="page-subtitle">Aqui está um resumo dos seus pets e agendamentos.</p>

      <div className="grid grid-cols-2 mb-16">
        <div className="stat-card">
          <div className="value">{pets.length}</div>
          <div className="label">Pets cadastrados</div>
        </div>
        <div className="stat-card">
          <div className="value">{upcoming.length}</div>
          <div className="label">Agendamentos futuros</div>
        </div>
      </div>

      <Card
        title="Próximos agendamentos"
        actions={<Link className="btn btn-secondary btn-sm" to="/cliente/agendamentos">Ver todos</Link>}
      >
        <Table
          columns={[
            { key: 'date', label: 'Data', render: (r) => new Date(r.date).toLocaleString('pt-BR') },
            { key: 'pet', label: 'Pet', render: (r) => r.pet?.name },
            { key: 'service', label: 'Serviço', render: (r) => r.service?.name },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          data={upcoming}
          emptyMessage="Você não tem agendamentos futuros."
        />
      </Card>
    </Layout>
  );
}
