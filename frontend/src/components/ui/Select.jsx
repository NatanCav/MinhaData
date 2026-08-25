export default function Select({
  id,
  label,
  erro,
  className = "",
  children,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${className}`}
        aria-invalid={Boolean(erro)}
        {...props}
      >
        {children}
      </select>
      {erro && <p className="text-xs text-red-500">{erro}</p>}
    </div>
  );
}
