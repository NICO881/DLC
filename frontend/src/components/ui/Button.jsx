/**
 * components/ui/Button.jsx
 */
const VARIANTS = {
  primary: "bg-clay-500 text-white hover:bg-clay-600 active:bg-clay-700",
  secondary: "bg-ink-700 text-white hover:bg-ink-800 active:bg-ink-900",
  outline: "bg-transparent border border-ink-300 text-ink-700 hover:bg-ink-50",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-50",
  danger: "bg-transparent text-clay-700 border border-clay-300 hover:bg-clay-50",
  success: "bg-leaf-500 text-white hover:bg-leaf-600",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  icon: Icon,
  as,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-card font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (as === "a") {
    return (
      <a className={classes} {...props}>
        {Icon && <Icon size={16} strokeWidth={2.25} />}
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={2.25} />}
      {children}
    </button>
  );
}
