const LABELS = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

export default function StatusBadge({ status }) {
  const cls = `badge badge-${status?.toLowerCase()}`;
  return <span className={cls}>{LABELS[status] || status}</span>;
}
