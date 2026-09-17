import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

// Fluxo simplificado para projeto acadêmico: gera um token de redefinição
// exibido na tela (em produção seria enviado por email).
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function requestToken(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
      if (data.resetToken) setResetToken(data.resetToken);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao solicitar redefinição.');
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/reset-password', { resetToken, newPassword });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao redefinir senha.');
    }
  }

  return (
    <div className="center-screen">
      <div className="card auth-card">
        <h2 style={{ marginTop: 0 }}>Recuperar senha</h2>
        <Alert type="error">{error}</Alert>
        <Alert type="success">{message}</Alert>

        <form onSubmit={requestToken} className="mb-16">
          <Input label="Email da conta" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" block variant="secondary">Solicitar token de redefinição</Button>
        </form>

        <form onSubmit={resetPassword}>
          <Input label="Token de redefinição" required value={resetToken} onChange={(e) => setResetToken(e.target.value)} />
          <Input label="Nova senha" type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Button type="submit" block>Redefinir senha</Button>
        </form>

        <div className="mt-16 text-sm" style={{ textAlign: 'center' }}>
          <Link to="/login">Voltar ao login</Link>
        </div>
      </div>
    </div>
  );
}
