const VARIANTES = {
  primario:
    "bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-gray-300 disabled:cursor-not-allowed",
  secundario:
    "bg-transparent text-gray-600 hover:text-emerald-600 disabled:text-gray-300 disabled:cursor-not-allowed",
};

export default function Button({
  children,
  variante = "primario",
  type = "button",
  disabled = false,
  carregando = false,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {carregando && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
