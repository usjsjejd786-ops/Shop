import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Input from '../components/Input';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';

const EMPTY_FORM = { petId: '', serviceId: '', veterinarianId: '', date: '', notes: '' };
const STATUS_OPTIONS = ['PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'];

export default function Appointments() {
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMINISTRADOR';

  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [cancelId, setCancelId] = useState(null);
  const [filters, setFilters] = useState({ date: '', status: '' });

  function load() {
    setLoading(true);
    const params = {};
    if (filters.date) params.date = filters.date;
    if (filters.status) params.status = filters.status;
    api.get('/appointments', { params }).then((res) => setAppointments(res.data)).finally(() => setLoading(false));
  }

  useEffect(() => {
    api.get('/pets').then((res) => setPets(res.data));
    api.get('/services').then((res) => setServices(res.data));
    api.get('/veterinarians').then((res) => setVets(res.data)).catch(() => setVets([]));
  }, []);

  useEffect(load, [filters.date, filters.status]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  }

  function openEdit(a) {
    setEditingId(a.id);
    setForm({
      petId: a.pet?.id || '',
      serviceId: a.service?.id || '',
      veterinarianId: a.veterinarian?.id || '',
      date: a.date ? a.date.substring(0, 16) : '',
      notes: a.notes || '',
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, date: new Date(form.date).toISOString() };
      if (editingId) await api.put(`/appointments/${editingId}`, payload);
      else await api.post('/appointments', payload);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar agendamento.');
    }
  }

  async function handleCancel() {
    await api.delete(`/appointments/${cancelId}`);
    setCancelId(null);
    load();
  }

  async function handleStatusChange(id, status) {
    await api.put(`/appointments/${id}`, { status });
    load();
  }

  if (loading) return <Layout><Loading /></Layout>;

  const columns = [
    { key: 'date', label: 'Data/Hora', render: (r) => new Date(r.date).toLocaleString('pt-BR') },
    { key: 'pet', label: 'Pet', render: (r) => r.pet?.name },
    ...(isAdmin ? [{ key: 'client', label: 'Cliente', render: (r) => r.client?.name }] : []),
    { key: 'service', label: 'Serviço', render: (r) => r.service?.name },
    { key: 'vet', label: 'Veterinário', render: (r) => r.veterinarian?.name || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (r) =>
        isAdmin ? (
          <select className="input" style={{ padding: '4px 8px' }} value={r.status} onChange={(e) => handleStatusChange(r.id, e.target.value)}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : (
          <StatusBadge status={r.status} />
        ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (r) =>
        ['PENDENTE', 'CONFIRMADO'].includes(r.status) && (
          <div className="flex gap-8">
            <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>Reagendar</Button>
            <Button size="sm" variant="danger" onClick={() => setCancelId(r.id)}>Cancelar</Button>
          </div>
        ),
    },
  ];

  return (
    <Layout>
      <div className="flex-between mb-16">
        <div>
          <h1 className="page-title">Agendamentos</h1>
          <p className="page-subtitle">
            {isAdmin ? 'Visualize e gerencie todos os agendamentos.' : 'Agende serviços para seus pets.'}
          </p>
        </div>
        <Button onClick={openCreate}>+ Novo Agendamento</Button>
      </div>

      {isAdmin && (
        <Card>
          <div className="grid grid-cols-2">
            <Input label="Filtrar por data" type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
            <div className="input-group">
              <label>Filtrar por status</label>
              <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">Todos</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <Table columns={columns} data={appointments} emptyMessage="Nenhum agendamento encontrado." />
      </Card>

      <Modal open={modalOpen} title={editingId ? 'Reagendar' : 'Novo Agendamento'} onClose={() => setModalOpen(false)}>
        <Alert type="error">{error}</Alert>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Pet</label>
            <select className="input" required value={form.petId} onChange={(e) => setForm({ ...form, petId: e.target.value })}>
              <option value="">Selecione...</option>
              {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Serviço</label>
            <select className="input" required value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}>
              <option value="">Selecione...</option>
              {services.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name} — R$ {Number(s.price).toFixed(2)}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Veterinário (opcional)</label>
            <select className="input" value={form.veterinarianId} onChange={(e) => setForm({ ...form, veterinarianId: e.target.value })}>
              <option value="">Sem preferência</option>
              {vets.filter((v) => v.active).map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <Input label="Data e horário" type="datetime-local" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input label="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button type="submit" block>Confirmar Agendamento</Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!cancelId}
        message="Deseja realmente cancelar este agendamento?"
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
      />
    </Layout>
  );
}
