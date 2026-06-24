/**
 * components/ui/Select.jsx
 */
export default function Select({ label, value, onChange, options, placeholder = "All", className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-ink-500 mb-1">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-card border border-ink-100 bg-white focus:outline-none focus:border-clay-500 text-ink-700"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
