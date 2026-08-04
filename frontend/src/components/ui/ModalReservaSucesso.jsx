import { useCallback, useEffect, useRef, useState } from "react";
import { IconeCalendario, IconeCheck, IconeFechar, IconeRelogio } from "./Icones";
import Button from "./Button";

const DURACAO_TRANSICAO_MS = 200;

function formatarData(data) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ModalReservaSucesso({ espaco, data, horario, onFechar }) {
  const [visivel, setVisivel] = useState(false);
  const painelRef = useRef(null);

  const fechar = useCallback(() => {
    setVisivel(false);
    setTimeout(onFechar, DURACAO_TRANSICAO_MS);
  }, [onFechar]);

  useEffect(() => {
    const quadro = requestAnimationFrame(() => setVisivel(true));
    return () => cancelAnimationFrame(quadro);
  }, []);

  useEffect(() => {
    painelRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(evento) {
      if (evento.key === "Escape") fechar();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fechar]);

  return (
    <div
      onClick={fechar}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6 transition-opacity duration-200 ${
        visivel ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-reserva-sucesso"
        tabIndex={-1}
        onClick={(evento) => evento.stopPropagation()}
        className={`w-full max-w-md rounded-2xl bg-white p-6 shadow-xl outline-none transition-all duration-200 ${
          visivel ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar"
            className="rounded text-gray-400 transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <IconeFechar className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <IconeCheck className="h-7 w-7" />
          </span>
          <h2
            id="titulo-reserva-sucesso"
            className="text-lg font-bold text-gray-900"
          >
            Reserva realizada com sucesso!
          </h2>
          <p className="text-sm text-gray-500">
            Enviamos os detalhes da sua reserva para o seu WhatsApp.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-800">{espaco.nome}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <IconeCalendario className="h-4 w-4" />
            {formatarData(data)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <IconeRelogio className="h-4 w-4" />
            {horario}
          </div>
        </div>

        <Button onClick={fechar} className="mt-6 w-full">
          Fechar
        </Button>
      </div>
    </div>
  );
}
