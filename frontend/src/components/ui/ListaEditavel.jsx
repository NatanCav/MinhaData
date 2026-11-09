import { useState } from "react";
import Button from "./Button";

export default function ListaEditavel({ label, itens, onAdicionar, onRemover, placeholder }) {
  const [valor, setValor] = useState("");

  function adicionar(evento) {
    evento.preventDefault();
    const texto = valor.trim();
    if (!texto) return;
    onAdicionar(texto);
    setValor("");
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>

      {itens.length > 0 && (
        <ul className="flex flex-col gap-2">
          {itens.map((item, indice) => (
            <li
              key={`${item}-${indice}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onRemover(indice)}
                aria-label={`Remover ${item}`}
                className="text-red-500 hover:text-red-600"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          value={valor}
          onChange={(evento) => setValor(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") adicionar(evento);
          }}
          placeholder={placeholder}
          className="w-full flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
        <Button type="button" variante="secundario" onClick={adicionar} className="shrink-0">
          Adicionar
        </Button>
      </div>
    </div>
  );
}
