import { useContext } from "react";
import { ReservaContext } from "./reservaContext.js";

export function useReserva() {
  const contexto = useContext(ReservaContext);
  if (!contexto) {
    throw new Error("useReserva deve ser usado dentro de um ReservaProvider");
  }
  return contexto;
}
