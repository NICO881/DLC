/**
 * components/ui/FormField.jsx
 */
export function TextField({ label, value, onChange, required, placeholder, type = "text", className = "", hint }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-ink-700 mb-1.5">
          {label}
          {required && <span className="text-clay-500"> *</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-card border border-ink-100 focus:outline-none focus:border-clay-500 text-sm"
      />
      {hint && <p className="text-xs text-ink-400 mt-1">{hint}</p>}
    </div>
  );
}

export function TextArea({ label, value, onChange, required, placeholder, rows = 4, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-ink-700 mb-1.5">
          {label}
          {required && <span className="text-clay-500"> *</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2.5 rounded-card border border-ink-100 focus:outline-none focus:border-clay-500 text-sm resize-none"
      />
    </div>
  );
}

export function FileDropzone({ file, onChange, accept, required, label = "File" }) {
  function handleChange(e) {
    const selected = e.target.files?.[0];
    if (selected) onChange(selected);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 mb-1.5">
        {label}
        {required && <span className="text-clay-500"> *</span>}
      </label>
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-ink-200 rounded-card py-8 px-4 text-center cursor-pointer hover:border-clay-300 hover:bg-clay-50/30 transition-colors">
        <input type="file" accept={accept} onChange={handleChange} className="hidden" />
        {file ? (
          <p className="text-sm font-medium text-ink-700">{file.name}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-ink-600">Click to choose a file</p>
            <p className="text-xs text-ink-400 mt-1">or drag and drop</p>
          </>
        )}
      </label>
    </div>
  );
}
