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

const EMPTY_FORM = { name: '', email: '', password: '', role: 'CLIENTE', phone: '' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    api.get('/users', { params: { search } }).then((res) => setUsers(res.data)).finally(() => setLoading(false));
  }
  useEffect(load, [search]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  }

  function openEdit(u) {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '' });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, { name: form.name, phone: form.phone, role: form.role });
      } else {
        await api.post('/users', form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar usuário.');
    }
  }

  async function toggleActive(u) {
    if (u.active) {
      await api.delete(`/users/${u.id}`);
    } else {
      await api.put(`/users/${u.id}`, { active: true });
    }
    load();
  }

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="flex-between mb-16">
        <div>
          <h1 className="page-title">Usuários</h1>
          <p className="page-subtitle">Gerencie clientes, veterinários e administradores.</p>
        </div>
        <Button onClick={openCreate}>+ Novo Usuário</Button>
      </div>

      <Card>
        <Input label="Pesquisar por nome ou email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Table
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Perfil' },
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
          data={users}
          emptyMessage="Nenhum usuário encontrado."
        />
      </Card>

      <Modal open={modalOpen} title={editingId ? 'Editar Usuário' : 'Novo Usuário'} onClose={() => setModalOpen(false)}>
        <Alert type="error">{error}</Alert>
        <form onSubmit={handleSubmit}>
          <Input label="Nome" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" required disabled={!!editingId} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {!editingId && (
            <Input label="Senha" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          )}
          <Input label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div className="input-group">
            <label>Perfil</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="CLIENTE">Cliente</option>
              <option value="VETERINARIO">Veterinário</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>
          <Button type="submit" block>Salvar</Button>
        </form>
      </Modal>
    </Layout>
  );
}
