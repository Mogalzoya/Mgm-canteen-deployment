export function ErrorNote({ children, onRetry }) {
  if (!children) return null;
  return (
    <div className="note note-error" role="alert">
      <span>{children}</span>
      {onRetry && <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
