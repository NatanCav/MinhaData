import { Link } from "react-router-dom";
import { IconeCalendario } from "../ui/Icones";

const LINKS = [
  { label: "Início", to: "/" },
  { label: "Espaços", to: "/espacos" },
  { label: "Sobre nós", to: "/#sobre" },
  { label: "Como funciona", to: "/#como-funciona" },
  { label: "Contato", to: "/#contato" },
];

export default function Footer() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <IconeCalendario className="h-5 w-5 text-emerald-600" />
          <span className="text-base font-bold text-gray-900">MinhaData</span>
        </Link>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
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

        <p className="text-sm text-gray-400">
          © {anoAtual} MinhaData. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
