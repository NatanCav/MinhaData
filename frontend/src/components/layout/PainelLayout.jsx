import { useState } from "react";
import { Outlet } from "react-router-dom";
import PainelSidebar from "./PainelSidebar";
import { IconeMenu } from "../ui/Icones";

export default function PainelLayout() {
  const [sidebarAberta, setSidebarAberta] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-gray-50">
      <PainelSidebar
        aberta={sidebarAberta}
        onFechar={() => setSidebarAberta(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-6 py-4 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarAberta(true)}
            aria-label="Abrir menu do painel"
            aria-expanded={sidebarAberta}
            className="rounded p-2 text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <IconeMenu className="h-6 w-6" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            Painel de gestão
          </span>
        </div>

        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
