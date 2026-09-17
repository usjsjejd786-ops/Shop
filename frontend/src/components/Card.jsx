export default function Card({ title, children, actions }) {
  return (
    <div className="card">
      {(title || actions) && (
        <div className="flex-between mb-16">
          {title && <h3 style={{ margin: 0 }}>{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
