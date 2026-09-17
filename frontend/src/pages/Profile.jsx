import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Card from '../components/Card';

export default function Profile() {
  const { user, updateStoredUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function saveProfile(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const { data } = await api.put('/auth/profile', form);
      updateStoredUser(data);
      setMessage('Dados atualizados com sucesso.');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar dados.');
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.put('/auth/change-password', passwordForm);
      setMessage('Senha alterada com sucesso.');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao alterar senha.');
    }
  }

  return (
    <Layout>
      <h1 className="page-title">Meu Perfil</h1>
      <p className="page-subtitle">Atualize seus dados pessoais e sua senha.</p>
      <Alert type="error">{error}</Alert>
      <Alert type="success">{message}</Alert>

      <div className="grid grid-cols-2">
        <Card title="Dados pessoais">
          <form onSubmit={saveProfile}>
            <Input label="Nome" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email" value={user.email} disabled />
            <Button type="submit">Salvar dados</Button>
          </form>
        </Card>

        <Card title="Alterar senha">
          <form onSubmit={changePassword}>
            <Input
              label="Senha atual"
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
            <Input
              label="Nova senha"
              type="password"
              required
              minLength={6}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
            <Button type="submit" variant="secondary">Alterar senha</Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
