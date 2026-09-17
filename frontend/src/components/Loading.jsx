export default function Loading({ label = 'Carregando...' }) {
  return (
    <div className="flex" style={{ flexDirection: 'column', alignItems: 'center', gap: 8, padding: 30 }}>
      <div className="loading-spinner" />
      <span className="text-muted text-sm">{label}</span>
    </div>
  );
}
