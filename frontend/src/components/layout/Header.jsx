import { useState } from "react";
import { Link } from "react-router-dom";
import { IconeCalendario, IconeFechar, IconeMenu } from "../ui/Icones";

const LINKS = [
  { label: "Início", to: "/" },
  { label: "Espaços", to: "/espacos" },
  { label: "Sobre nós", to: "/#sobre" },
  { label: "Como funciona", to: "/#como-funciona" },
  { label: "Contato", to: "/#contato" },
];

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <IconeCalendario className="h-6 w-6 text-emerald-600" />
          <span className="text-xl font-bold text-gray-900">MinhaData</span>
        </Link>

        {/* Navegação desktop */}
        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-emerald-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA desktop */}
        <Link
          to="/espacos"
          className="hidden items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 md:inline-flex"
        >
          <IconeCalendario className="h-4 w-4" />
          Fazer reserva
        </Link>

        {/* Botão menu mobile */}
        <button
          type="button"
          onClick={() => setMenuAberto((aberto) => !aberto)}
          className="p-2 text-gray-700 md:hidden"
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
        >
          {menuAberto ? (
            <IconeFechar className="h-6 w-6" />
          ) : (
            <IconeMenu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Menu mobile */}
      {menuAberto && (
        <nav className="flex flex-col gap-4 border-t border-gray-100 bg-white px-6 py-4 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMenuAberto(false)}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-emerald-600"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/espacos"
            onClick={() => setMenuAberto(false)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
          >
            <IconeCalendario className="h-4 w-4" />
            Fazer reserva
          </Link>
        </nav>
      )}
    </header>
  );
}