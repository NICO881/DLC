/**
 * components/ui/Badge.jsx
 *
 * Small pill used for resource status (Draft/Pending/Published/...) and
 * resource type. Color mapping lives here so status colors stay consistent
 * everywhere they appear (cards, tables, detail pages).
 */
const STATUS_STYLES = {
  DRAFT: "bg-ink-100 text-ink-700",
  PENDING_REVIEW: "bg-gold-50 text-gold-600 border border-gold-300",
  PUBLISHED: "bg-leaf-50 text-leaf-600 border border-leaf-300",
  INACTIVE: "bg-ink-50 text-ink-500 border border-ink-300",
  ARCHIVED: "bg-clay-50 text-clay-700 border border-clay-300",
};

const STATUS_LABELS = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  PUBLISHED: "Published",
  INACTIVE: "Inactive",
  ARCHIVED: "Archived",
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-ink-100 text-ink-700";
  const label = STATUS_LABELS[status] || status;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}
    >
      {label}
    </span>
  );
}

export function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ink-50 text-ink-700 ${className}`}
    >
      {children}
    </span>
  );
}
