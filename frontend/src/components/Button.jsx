export default function Button({ variant = 'primary', block, size, children, ...props }) {
  const cls = ['btn', `btn-${variant}`, block ? 'btn-block' : '', size === 'sm' ? 'btn-sm' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
