import { useRef, useState } from "react";
import Spinner from "./Spinner";

export default function ImagemUpload({ label, valor, onEnviar, erro, className = "" }) {
  const inputRef = useRef(null);
  const [enviando, setEnviando] = useState(false);
  const [erroLocal, setErroLocal] = useState(null);

  async function handleChange(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;

    setErroLocal(null);
    setEnviando(true);
    try {
      await onEnviar(arquivo);
    } catch (erroEnvio) {
      setErroLocal(erroEnvio.message || "Não foi possível enviar a imagem.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <p className="text-sm font-medium text-gray-700">{label}</p>}

      {valor && (
        <img
          src={valor}
          alt=""
          className="h-32 w-32 rounded-lg border border-gray-200 object-cover"
        />
      )}

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-emerald-600 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          {enviando && <Spinner aria-hidden="true" />}
          {enviando ? "Enviando..." : valor ? "Trocar imagem" : "Escolher imagem"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {(erroLocal || erro) && <p className="text-xs text-red-500">{erroLocal || erro}</p>}
    </div>
  );
}
