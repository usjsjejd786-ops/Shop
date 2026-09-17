import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="center-screen">
      <div className="card" style={{ textAlign: 'center', maxWidth: 420 }}>
        <h2>Página não encontrada</h2>
        <Link className="btn btn-primary" to="/">Voltar ao início</Link>
      </div>
    </div>
  );
}
