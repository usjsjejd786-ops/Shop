import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import Card from '../components/Card';
import Button from '../components/Button';

export default function PetMedicalRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get(`/pets/${id}`), api.get(`/pets/${id}/medical-records`)])
      .then(([petRes, recRes]) => {
        setPet(petRes.data);
        setRecords(recRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>← Voltar</Button>
      <h1 className="page-title mt-16">Prontuário de {pet?.name}</h1>
      <p className="page-subtitle">Histórico de consultas registrado pelos veterinários. Este histórico é somente leitura.</p>

      {records.length === 0 && (
        <Card><p className="text-muted">Nenhum registro de consulta ainda.</p></Card>
      )}

      {records.map((r) => (
        <Card key={r.id} title={new Date(r.date).toLocaleString('pt-BR')}>
          <p><strong>Veterinário:</strong> {r.veterinarian?.name}</p>
          {r.diagnosis && <p><strong>Diagnóstico:</strong> {r.diagnosis}</p>}
          {r.observations && <p><strong>Observações:</strong> {r.observations}</p>}
          {r.treatment && <p><strong>Tratamento/Prescrição:</strong> {r.treatment}</p>}
        </Card>
      ))}
    </Layout>
  );
}
