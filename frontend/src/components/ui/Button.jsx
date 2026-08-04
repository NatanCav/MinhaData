import Spinner from "./Spinner";

const VARIANTES = {
  primario:
    "bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-gray-300 disabled:cursor-not-allowed",
  secundario:
    "bg-transparent text-gray-600 hover:text-emerald-600 disabled:text-gray-300 disabled:cursor-not-allowed",
};

const FOCO =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

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
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${FOCO} ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {carregando && <Spinner aria-hidden="true" />}
      {children}
    </button>
  );
}
