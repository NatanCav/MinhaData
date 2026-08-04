import { useEffect } from "react";
import { IconeCheck, IconeFechar } from "./Icones";

const TONS = {
  sucesso: "bg-emerald-700 text-white",
  erro: "bg-red-600 text-white",
  info: "bg-gray-800 text-white",
};

export default function Toast({
  mensagem,
  tom = "sucesso",
  visivel = false,
  onFechar,
  duracao = 4000,
}) {
  useEffect(() => {
    if (!visivel || !onFechar) return undefined;

    const temporizador = setTimeout(onFechar, duracao);
    return () => clearTimeout(temporizador);
  }, [visivel, onFechar, duracao]);

  if (!visivel) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-xl ${TONS[tom]}`}
    >
      <IconeCheck className="h-4 w-4 shrink-0" />
      <span>{mensagem}</span>
      {onFechar && (
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar notificação"
          className="rounded text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700"
        >
          <IconeFechar className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
