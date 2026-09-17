// Tabela genérica: columns = [{ key, label, render? }]
export default function Table({ columns, data, emptyMessage = 'Nenhum registro encontrado.' }) {
  if (!data || data.length === 0) {
    return <p className="text-muted text-sm">{emptyMessage}</p>;
  }
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
