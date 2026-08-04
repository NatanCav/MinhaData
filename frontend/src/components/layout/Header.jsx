import { useState } from "react";
import { Link } from "react-router-dom";
import { IconeCalendario, IconeFechar, IconeMenu } from "../ui/Icones";
import { useAuth } from "../../context/useAuth";
import Avatar from "../ui/Avatar";

const LINKS = [
  { label: "Início", to: "/" },
  { label: "Espaços", to: "/espacos" },
  { label: "Sobre nós", to: "/#sobre" },
  { label: "Como funciona", to: "/#como-funciona" },
  { label: "Contato", to: "/#contato" },
];

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { usuario, autenticado } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <IconeCalendario className="h-6 w-6 text-emerald-600" />
          <span className="text-xl font-bold text-gray-900">MinhaData</span>
        </Link>

        {/* Navegação desktop */}
        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="rounded text-sm font-medium text-gray-600 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA e autenticação desktop */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/espacos"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <IconeCalendario className="h-4 w-4" />
            Fazer reserva
          </Link>

          {autenticado ? (
            <Link
              to="/perfil"
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              aria-label="Meu perfil"
            >
              <Avatar nome={usuario.nome} tamanho="sm" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded text-sm font-medium text-gray-600 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              Entrar
            </Link>
          )}
        </div>

        {/* Botão menu mobile */}
        <button
          type="button"
          onClick={() => setMenuAberto((aberto) => !aberto)}
          className="rounded p-2 text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 md:hidden"
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
              className="rounded text-sm font-medium text-gray-600 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/espacos"
            onClick={() => setMenuAberto(false)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <IconeCalendario className="h-4 w-4" />
            Fazer reserva
          </Link>

          {autenticado ? (
            <Link
              to="/perfil"
              onClick={() => setMenuAberto(false)}
              className="flex items-center gap-3 rounded text-sm font-medium text-gray-600 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <Avatar nome={usuario.nome} tamanho="sm" />
              Meu perfil
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuAberto(false)}
              className="rounded text-sm font-medium text-gray-600 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              Entrar
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}