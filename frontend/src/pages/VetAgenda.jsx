import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import Card from '../components/Card';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

const TABS = [
  { key: 'hoje', label: 'Agenda do dia' },
  { key: 'futura', label: 'Agenda futura' },
  { key: 'anteriores', label: 'Consultas anteriores' },
];

export default function VetAgenda() {
  const [tab, setTab] = useState('hoje');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const now = new Date();
    let params = {};
    if (tab === 'hoje') params.date = now.toISOString().substring(0, 10);

    api.get('/appointments', { params }).then((res) => {
      let data = res.data;
      if (tab === 'futura') data = data.filter((a) => new Date(a.date) > now);
      if (tab === 'anteriores') data = data.filter((a) => new Date(a.date) < now);
      setAppointments(data);
    }).finally(() => setLoading(false));
  }, [tab]);

  return (
    <Layout>
      <h1 className="page-title">Agenda</h1>
      <p className="page-subtitle">Visualize seus atendimentos.</p>

      <div className="flex gap-8 mb-16">
        {TABS.map((t) => (
          <Button key={t.key} size="sm" variant={tab === t.key ? 'primary' : 'secondary'} onClick={() => setTab(t.key)}>
            {t.label}
          </Button>
        ))}
      </div>

      <Card>
        {loading ? <Loading /> : (
          <Table
            columns={[
              { key: 'date', label: 'Data/Hora', render: (r) => new Date(r.date).toLocaleString('pt-BR') },
              { key: 'client', label: 'Cliente', render: (r) => r.client?.name },
              { key: 'pet', label: 'Pet', render: (r) => r.pet?.name },
              { key: 'service', label: 'Serviço', render: (r) => r.service?.name },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={appointments}
            emptyMessage="Nenhum agendamento encontrado."
          />
        )}
      </Card>
    </Layout>
  );
}
