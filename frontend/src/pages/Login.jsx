import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, dashboardPathForRole } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(dashboardPathForRole(user.role));
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-screen">
      <div className="card auth-card">
        <h2 style={{ marginTop: 0 }}>🐾 Entrar</h2>
        <p className="text-muted text-sm">Acesse sua conta do sistema Pet Shop &amp; Veterinária.</p>
        <Alert type="error">{error}</Alert>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Senha"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" block disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <div className="mt-16 text-sm" style={{ textAlign: 'center' }}>
          <Link to="/esqueci-senha">Esqueci minha senha</Link>
        </div>
        <div className="mt-16 text-sm" style={{ textAlign: 'center' }}>
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </div>
        <div className="mt-16 text-sm text-muted" style={{ textAlign: 'center' }}>
          Usuários de teste: admin@petshop.com / veterinario@petshop.com / cliente@petshop.com (senha: senha123)
        </div>
      </div>
    </div>
  );
}
