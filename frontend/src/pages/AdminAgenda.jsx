import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import Card from '../components/Card';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import Input from '../components/Input';

export default function AdminAgenda() {
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [vetFilter, setVetFilter] = useState('');
  const [vets, setVets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/veterinarians').then((res) => setVets(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { date };
    if (vetFilter) params.veterinarianId = vetFilter;
    api.get('/appointments', { params }).then((res) => setAppointments(res.data)).finally(() => setLoading(false));
  }, [date, vetFilter]);

  return (
    <Layout>
      <h1 className="page-title">Agenda do Dia</h1>
      <p className="page-subtitle">Visualize todos os serviços e consultas do dia.</p>

      <Card>
        <div className="grid grid-cols-2">
          <Input label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="input-group">
            <label>Veterinário</label>
            <select className="input" value={vetFilter} onChange={(e) => setVetFilter(e.target.value)}>
              <option value="">Todos</option>
              {vets.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        {loading ? <Loading /> : (
          <Table
            columns={[
              { key: 'time', label: 'Horário', render: (r) => new Date(r.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) },
              { key: 'client', label: 'Cliente', render: (r) => r.client?.name },
              { key: 'pet', label: 'Pet', render: (r) => r.pet?.name },
              { key: 'vet', label: 'Veterinário', render: (r) => r.veterinarian?.name || '—' },
              { key: 'service', label: 'Serviço', render: (r) => r.service?.name },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={appointments}
            emptyMessage="Nenhum agendamento para esta data."
          />
        )}
      </Card>
    </Layout>
  );
}
