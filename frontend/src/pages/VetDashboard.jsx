import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import Card from '../components/Card';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';

export default function VetDashboard() {
  const { user } = useAuth();
  const [today, setToday] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const date = new Date().toISOString().substring(0, 10);
    api.get('/appointments', { params: { date } })
      .then((res) => setToday(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <h1 className="page-title">Olá, Dr(a). {user.name.split(' ')[0]} 👋</h1>
      <p className="page-subtitle">Resumo da sua agenda de hoje.</p>

      <div className="stat-card mb-16" style={{ maxWidth: 220 }}>
        <div className="value">{today.length}</div>
        <div className="label">Consultas hoje</div>
      </div>

      <Card
        title="Agenda de hoje"
        actions={<Link className="btn btn-secondary btn-sm" to="/vet/agenda">Ver agenda completa</Link>}
      >
        <Table
          columns={[
            { key: 'time', label: 'Horário', render: (r) => new Date(r.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) },
            { key: 'client', label: 'Cliente', render: (r) => r.client?.name },
            { key: 'pet', label: 'Pet', render: (r) => r.pet?.name },
            { key: 'service', label: 'Serviço', render: (r) => r.service?.name },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          data={today}
          emptyMessage="Nenhuma consulta agendada para hoje."
        />
      </Card>
    </Layout>
  );
}
