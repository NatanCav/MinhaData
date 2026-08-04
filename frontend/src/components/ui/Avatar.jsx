const TAMANHOS = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
};

function obterIniciais(nome) {
  if (!nome) return "";
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export default function Avatar({ nome, tamanho = "md", className = "" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700 ${TAMANHOS[tamanho]} ${className}`}
      aria-hidden="true"
    >
      {obterIniciais(nome)}
    </span>
  );
}
