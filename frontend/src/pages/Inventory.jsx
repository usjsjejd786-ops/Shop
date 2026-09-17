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

const EMPTY_FORM = { name: '', category: '', quantity: '', minQuantity: '', price: '', description: '' };

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [movementProduct, setMovementProduct] = useState(null);
  const [movement, setMovement] = useState({ type: 'ENTRADA', quantity: '', reason: '' });

  function load() {
    setLoading(true);
    api.get('/inventory').then((res) => setProducts(res.data)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category || '',
      quantity: p.quantity,
      minQuantity: p.minQuantity,
      price: p.price,
      description: p.description || '',
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        const { quantity, ...rest } = form; // quantidade só muda via movimentação
        await api.put(`/inventory/${editingId}`, rest);
      } else {
        await api.post('/inventory', form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar produto.');
    }
  }

  async function handleDelete(id) {
    await api.delete(`/inventory/${id}`);
    load();
  }

  async function handleMovement(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/inventory/${movementProduct.id}/movement`, movement);
      setMovementProduct(null);
      setMovement({ type: 'ENTRADA', quantity: '', reason: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao registrar movimentação.');
    }
  }

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="flex-between mb-16">
        <div>
          <h1 className="page-title">Estoque</h1>
          <p className="page-subtitle">Gerencie produtos e movimentações de entrada/saída.</p>
        </div>
        <Button onClick={openCreate}>+ Novo Produto</Button>
      </div>

      <Card>
        <Table
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'category', label: 'Categoria' },
            {
              key: 'quantity',
              label: 'Quantidade',
              render: (r) => (
                <span>
                  {r.quantity} {r.lowStock && <span className="badge badge-cancelado" style={{ marginLeft: 6 }}>Estoque baixo</span>}
                </span>
              ),
            },
            { key: 'minQuantity', label: 'Qtd. mínima' },
            { key: 'price', label: 'Preço', render: (r) => `R$ ${Number(r.price).toFixed(2)}` },
            {
              key: 'actions',
              label: 'Ações',
              render: (r) => (
                <div className="flex gap-8">
                  <Button size="sm" onClick={() => setMovementProduct(r)}>Movimentar</Button>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>Desativar</Button>
                </div>
              ),
            },
          ]}
          data={products}
          emptyMessage="Nenhum produto cadastrado."
        />
      </Card>

      <Modal open={modalOpen} title={editingId ? 'Editar Produto' : 'Novo Produto'} onClose={() => setModalOpen(false)}>
        <Alert type="error">{error}</Alert>
        <form onSubmit={handleSubmit}>
          <Input label="Nome" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          {!editingId && (
            <Input label="Quantidade inicial" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          )}
          <Input label="Quantidade mínima" type="number" value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: e.target.value })} />
          <Input label="Preço (R$)" type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button type="submit" block>Salvar</Button>
        </form>
      </Modal>

      <Modal open={!!movementProduct} title={`Movimentar estoque: ${movementProduct?.name || ''}`} onClose={() => setMovementProduct(null)}>
        <Alert type="error">{error}</Alert>
        <form onSubmit={handleMovement}>
          <div className="input-group">
            <label>Tipo</label>
            <select className="input" value={movement.type} onChange={(e) => setMovement({ ...movement, type: e.target.value })}>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
          </div>
          <Input label="Quantidade" type="number" required min="1" value={movement.quantity} onChange={(e) => setMovement({ ...movement, quantity: e.target.value })} />
          <Input label="Motivo" value={movement.reason} onChange={(e) => setMovement({ ...movement, reason: e.target.value })} />
          <Button type="submit" block>Registrar Movimentação</Button>
        </form>
      </Modal>
    </Layout>
  );
}
