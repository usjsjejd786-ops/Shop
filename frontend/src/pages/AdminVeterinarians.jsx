import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Alert from '../components/Alert';

const EMPTY_FORM = { name: '', email: '', password: '', phone: '', specialty: '', licenseNumber: '' };

export default function AdminVeterinarians() {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    api.get('/veterinarians').then((res) => setVets(res.data)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  }

  function openEdit(v) {
    setEditingId(v.id);
    setForm({
      name: v.name,
      email: v.email,
      password: '',
      phone: v.phone || '',
      specialty: v.veterinarianProfile?.specialty || '',
      licenseNumber: v.veterinarianProfile?.licenseNumber || '',
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/veterinarians/${editingId}`, form);
      } else {
        await api.post('/veterinarians', form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar veterinário.');
    }
  }

  async function toggleActive(v) {
    await api.put(`/veterinarians/${v.id}`, { active: !v.active });
    load();
  }

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="flex-between mb-16">
        <div>
          <h1 className="page-title">Veterinários</h1>
          <p className="page-subtitle">Cadastre e gerencie os veterinários do pet shop.</p>
        </div>
        <Button onClick={openCreate}>+ Novo Veterinário</Button>
      </div>

      <Card>
        <Table
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'email', label: 'Email' },
            { key: 'specialty', label: 'Especialidade', render: (r) => r.veterinarianProfile?.specialty || '—' },
            { key: 'license', label: 'CRMV', render: (r) => r.veterinarianProfile?.licenseNumber || '—' },
            { key: 'active', label: 'Status', render: (r) => (r.active ? 'Ativo' : 'Inativo') },
            {
              key: 'actions',
              label: 'Ações',
              render: (r) => (
                <div className="flex gap-8">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>Editar</Button>
                  <Button size="sm" variant={r.active ? 'danger' : 'secondary'} onClick={() => toggleActive(r)}>
                    {r.active ? 'Desativar' : 'Reativar'}
                  </Button>
                </div>
              ),
            },
          ]}
          data={vets}
          emptyMessage="Nenhum veterinário cadastrado."
        />
      </Card>

      <Modal open={modalOpen} title={editingId ? 'Editar Veterinário' : 'Novo Veterinário'} onClose={() => setModalOpen(false)}>
        <Alert type="error">{error}</Alert>
        <form onSubmit={handleSubmit}>
          <Input label="Nome" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" required disabled={!!editingId} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {!editingId && (
            <Input label="Senha" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          )}
          <Input label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Especialidade" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
          <Input label="CRMV" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
          <Button type="submit" block>Salvar</Button>
        </form>
      </Modal>
    </Layout>
  );
}
