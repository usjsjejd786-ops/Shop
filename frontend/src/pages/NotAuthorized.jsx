import { Link } from 'react-router-dom';

export default function NotAuthorized() {
  return (
    <div className="center-screen">
      <div className="card" style={{ textAlign: 'center', maxWidth: 420 }}>
        <h2>Acesso não autorizado</h2>
        <p className="text-muted">Seu perfil não tem permissão para acessar esta página.</p>
        <Link className="btn btn-primary" to="/">Voltar ao início</Link>
      </div>
    </div>
  );
}
