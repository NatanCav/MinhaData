import { useState } from "react";

const LINKS = [
  { label: "Início", href: "#inicio" },
  { label: "Espaços", href: "#espacos" },
  { label: "Sobre nós", href: "#sobre" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Contato", href: "#contato" },
];

function IconeCalendario({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconeMenu({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconeFechar({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="#inicio" className="flex items-center gap-2">
          <IconeCalendario className="h-6 w-6 text-emerald-600" />
          <span className="text-xl font-bold text-gray-900">MinhaData</span>
        </a>

        {/* Navegação desktop */}
        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-emerald-600"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA desktop */}
        <a
          href="#espacos"
          className="hidden items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 md:inline-flex"
        >
          <IconeCalendario className="h-4 w-4" />
          Fazer reserva
        </a>

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
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuAberto(false)}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-emerald-600"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#espacos"
            onClick={() => setMenuAberto(false)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
          >
            <IconeCalendario className="h-4 w-4" />
            Fazer reserva
          </a>
        </nav>
      )}
    </header>
  );
}