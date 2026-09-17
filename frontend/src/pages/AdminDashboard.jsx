import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import Loading from '../components/Loading';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <Layout><Loading /></Layout>;

  const cards = [
    { label: 'Total de clientes', value: stats.totalClients },
    { label: 'Total de veterinários', value: stats.totalVets },
    { label: 'Total de pets', value: stats.totalPets },
    { label: 'Agendamentos hoje', value: stats.appointmentsToday },
    { label: 'Consultas pendentes', value: stats.pendingAppointments },
    { label: 'Serviços cadastrados', value: stats.totalServices },
    { label: 'Produtos em estoque', value: stats.inventory.totalProducts },
    { label: 'Itens com estoque baixo', value: stats.inventory.lowStockCount },
  ];

  return (
    <Layout>
      <h1 className="page-title">Dashboard Administrativo</h1>
      <p className="page-subtitle">Visão geral do sistema.</p>

      <div className="grid grid-cols-4">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <div className="value">{c.value}</div>
            <div className="label">{c.label}</div>
          </div>
        ))}
      </div>

      {stats.inventory.lowStockCount > 0 && (
        <div className="alert alert-error mt-16">
          ⚠️ Há {stats.inventory.lowStockCount} produto(s) com estoque baixo. Verifique a página de Estoque.
        </div>
      )}
    </Layout>
  );
}
