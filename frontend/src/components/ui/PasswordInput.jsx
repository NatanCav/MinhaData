import { useState } from "react";
import { IconeOlho, IconeOlhoFechado } from "./Icones";

export default function PasswordInput({ id, label, erro, className = "", ...props }) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visivel ? "text" : "password"}
          className={`w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm text-gray-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${className}`}
          aria-invalid={Boolean(erro)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisivel((atual) => !atual)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          {visivel ? (
            <IconeOlhoFechado className="h-4 w-4" />
          ) : (
            <IconeOlho className="h-4 w-4" />
          )}
        </button>
      </div>
      {erro && <p className="text-xs text-red-500">{erro}</p>}
    </div>
  );
}
