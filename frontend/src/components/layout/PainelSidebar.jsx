import { Link, NavLink } from "react-router-dom";
import {
  IconeCalendario,
  IconeEspacos,
  IconeFechar,
  IconePainel,
  IconeSair,
} from "../ui/Icones";

const ITENS_NAVEGACAO = [
  { label: "Painel", to: "/gestao", icone: IconePainel, fim: true },
  { label: "Reservas", to: "/gestao/reservas", icone: IconeCalendario },
  { label: "Calendário", to: "/gestao/calendario", icone: IconeCalendario },
  { label: "Espaços", to: "/gestao/espacos", icone: IconeEspacos },
];

export default function PainelSidebar({ aberta, onFechar }) {
  return (
    <>
      {aberta && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onFechar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-100 bg-white transition-transform duration-300 md:relative md:inset-auto md:z-auto md:translate-x-0 md:transition-none ${
          aberta ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <Link
            to="/gestao"
            onClick={onFechar}
            className="flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <IconeCalendario className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">MinhaData</span>
          </Link>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar menu do painel"
            className="rounded p-2 text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 md:hidden"
          >
            <IconeFechar className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
          {ITENS_NAVEGACAO.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.fim}
              onClick={onFechar}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:text-emerald-600"
                }`
              }
            >
              <item.icone className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 px-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <IconeSair className="h-5 w-5" />
            Voltar ao site
          </Link>
        </div>
      </aside>
    </>
  );
}
