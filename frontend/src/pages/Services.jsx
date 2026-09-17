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

const EMPTY_FORM = { name: '', description: '', price: '', duration: '' };

export default function Services() {
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMINISTRADOR';
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  function load() {
    setLoading(true);
    api.get('/services').then((res) => setServices(res.data)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  }

  function openEdit(s) {
    setEditingId(s.id);
    setForm({ name: s.name, description: s.description || '', price: s.price, duration: s.duration });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) await api.put(`/services/${editingId}`, form);
      else await api.post('/services', form);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar serviço.');
    }
  }

  async function handleDelete() {
    await api.delete(`/services/${confirmId}`);
    setConfirmId(null);
    load();
  }

  if (loading) return <Layout><Loading /></Layout>;

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'description', label: 'Descrição' },
    { key: 'price', label: 'Preço', render: (r) => `R$ ${Number(r.price).toFixed(2)}` },
    { key: 'duration', label: 'Duração', render: (r) => `${r.duration} min` },
  ];
  if (isAdmin) {
    columns.push({
      key: 'status',
      label: 'Status',
      render: (r) => (r.active ? 'Ativo' : 'Inativo'),
    });
    columns.push({
      key: 'actions',
      label: 'Ações',
      render: (r) => (
        <div className="flex gap-8">
          <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>Editar</Button>
          <Button size="sm" variant="danger" onClick={() => setConfirmId(r.id)}>Desativar</Button>
        </div>
      ),
    });
  }

  return (
    <Layout>
      <div className="flex-between mb-16">
        <div>
          <h1 className="page-title">Serviços</h1>
          <p className="page-subtitle">
            {isAdmin ? 'Gerencie os serviços oferecidos pelo pet shop.' : 'Conheça os serviços disponíveis.'}
          </p>
        </div>
        {isAdmin && <Button onClick={openCreate}>+ Novo Serviço</Button>}
      </div>

      <Card>
        <Table columns={columns} data={services} emptyMessage="Nenhum serviço cadastrado." />
      </Card>

      {isAdmin && (
        <Modal open={modalOpen} title={editingId ? 'Editar Serviço' : 'Novo Serviço'} onClose={() => setModalOpen(false)}>
          <Alert type="error">{error}</Alert>
          <form onSubmit={handleSubmit}>
            <Input label="Nome" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input label="Preço (R$)" type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Input label="Duração (minutos)" type="number" required value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <Button type="submit" block>Salvar</Button>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirmId}
        message="Deseja desativar este serviço? Ele deixará de aparecer para novos agendamentos."
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </Layout>
  );
}
