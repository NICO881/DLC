/**
 * components/ui/Card.jsx
 */
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-card border border-ink-100 shadow-shelf ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-ink-50 flex items-center justify-center mb-4">
          <Icon size={26} className="text-ink-500" strokeWidth={1.75} />
        </div>
      )}
      <h3 className="font-display text-lg text-ink-800 mb-1">{title}</h3>
      {message && <p className="text-ink-500 text-sm max-w-sm mb-4">{message}</p>}
      {action}
    </div>
  );
}

export function Spinner({ className = "" }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-ink-200 border-t-clay-500 w-5 h-5 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner className="w-8 h-8 border-[3px]" />
    </div>
  );
}
