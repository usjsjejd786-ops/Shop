import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Input from '../components/Input';
import Alert from '../components/Alert';

const EMPTY_FORM = { name: '', species: '', breed: '', sex: '', birthDate: '', weight: '', notes: '' };

export default function Pets() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  function load() {
    setLoading(true);
    api.get('/pets').then((res) => setPets(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  }

  function openEdit(pet) {
    setEditingId(pet.id);
    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      sex: pet.sex || '',
      birthDate: pet.birthDate ? pet.birthDate.substring(0, 10) : '',
      weight: pet.weight || '',
      notes: pet.notes || '',
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/pets/${editingId}`, form);
      } else {
        await api.post('/pets', form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar pet.');
    }
  }

  async function handleDelete() {
    await api.delete(`/pets/${confirmId}`);
    setConfirmId(null);
    load();
  }

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="flex-between mb-16">
        <div>
          <h1 className="page-title">Meus Pets</h1>
          <p className="page-subtitle">Cadastre e gerencie os dados dos seus pets.</p>
        </div>
        <Button onClick={openCreate}>+ Novo Pet</Button>
      </div>

      <Card>
        <Table
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'species', label: 'Espécie' },
            { key: 'breed', label: 'Raça' },
            { key: 'sex', label: 'Sexo' },
            { key: 'weight', label: 'Peso (kg)' },
            {
              key: 'actions',
              label: 'Ações',
              render: (r) => (
                <div className="flex gap-8">
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/pets/${r.id}/prontuario`)}>Prontuário</Button>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => setConfirmId(r.id)}>Excluir</Button>
                </div>
              ),
            },
          ]}
          data={pets}
          emptyMessage="Nenhum pet cadastrado ainda."
        />
      </Card>

      <Modal open={modalOpen} title={editingId ? 'Editar Pet' : 'Novo Pet'} onClose={() => setModalOpen(false)}>
        <Alert type="error">{error}</Alert>
        <form onSubmit={handleSubmit}>
          <Input label="Nome" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Espécie" required value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} />
          <Input label="Raça" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
          <Input label="Sexo" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} />
          <Input label="Data de nascimento" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
          <Input label="Peso (kg)" type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          <Input label="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button type="submit" block>Salvar</Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        message="Tem certeza que deseja excluir este pet? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </Layout>
  );
}
