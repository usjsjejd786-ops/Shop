import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import Card from '../components/Card';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Alert from '../components/Alert';

export default function VetConsultations() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null); // appointment sendo atendido
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ diagnosis: '', observations: '', treatment: '' });
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    api.get('/appointments').then((res) => setAppointments(res.data)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function openConsultation(appt) {
    setActive(appt);
    setForm({ diagnosis: '', observations: '', treatment: '' });
    setError('');
    const { data } = await api.get(`/pets/${appt.pet.id}/medical-records`);
    setHistory(data);
  }

  async function finalizeConsultation(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/pets/${active.pet.id}/medical-records`, { ...form, appointmentId: active.id });
      setActive(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao registrar consulta.');
    }
  }

  if (loading) return <Layout><Loading /></Layout>;

  const pending = appointments.filter((a) => ['PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO'].includes(a.status));
  const done = appointments.filter((a) => a.status === 'CONCLUIDO');

  return (
    <Layout>
      <h1 className="page-title">Minhas Consultas</h1>
      <p className="page-subtitle">Atenda seus pacientes e registre o prontuário.</p>

      <Card title="Consultas a realizar">
        <Table
          columns={[
            { key: 'date', label: 'Data/Hora', render: (r) => new Date(r.date).toLocaleString('pt-BR') },
            { key: 'client', label: 'Cliente', render: (r) => r.client?.name },
            { key: 'pet', label: 'Pet', render: (r) => r.pet?.name },
            { key: 'service', label: 'Serviço', render: (r) => r.service?.name },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            {
              key: 'actions',
              label: 'Ações',
              render: (r) => <Button size="sm" onClick={() => openConsultation(r)}>Atender</Button>,
            },
          ]}
          data={pending}
          emptyMessage="Nenhuma consulta pendente."
        />
      </Card>

      <Card title="Consultas concluídas">
        <Table
          columns={[
            { key: 'date', label: 'Data/Hora', render: (r) => new Date(r.date).toLocaleString('pt-BR') },
            { key: 'pet', label: 'Pet', render: (r) => r.pet?.name },
            { key: 'service', label: 'Serviço', render: (r) => r.service?.name },
          ]}
          data={done}
          emptyMessage="Nenhuma consulta concluída ainda."
        />
      </Card>

      <Modal open={!!active} title={`Atender: ${active?.pet?.name || ''}`} onClose={() => setActive(null)}>
        {active && (
          <>
            <p className="text-sm text-muted">
              Cliente: {active.client?.name} • Serviço: {active.service?.name}
            </p>

            {history.length > 0 && (
              <details className="mb-16">
                <summary className="text-sm" style={{ cursor: 'pointer' }}>Ver histórico do pet ({history.length})</summary>
                {history.map((h) => (
                  <div key={h.id} className="text-sm mt-16">
                    <strong>{new Date(h.date).toLocaleDateString('pt-BR')}:</strong> {h.diagnosis || 'sem diagnóstico registrado'}
                  </div>
                ))}
              </details>
            )}

            <Alert type="error">{error}</Alert>
            <form onSubmit={finalizeConsultation}>
              <Input label="Diagnóstico" required value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
              <Input label="Observações" value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} />
              <Input label="Tratamento/Prescrição" value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} />
              <Button type="submit" block>Finalizar Consulta</Button>
            </form>
          </>
        )}
      </Modal>
    </Layout>
  );
}
