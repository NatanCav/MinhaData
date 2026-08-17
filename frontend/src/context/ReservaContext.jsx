import { useMemo, useState } from "react";
import { ReservaContext } from "./reservaContext.js";

export function ReservaProvider({ children }) {
  const [reserva, setReserva] = useState(null);

  function iniciarReserva({ espaco, data, horario, horarioInicio, horarioFim }) {
    setReserva({
      espaco,
      data,
      horario,
      horarioInicio,
      horarioFim,
      formulario: { nome: "", telefone: "", email: "", observacoes: "" },
    });
  }

  function definirFormulario(formulario) {
    setReserva((atual) => (atual ? { ...atual, formulario } : atual));
  }

  function limparReserva() {
    setReserva(null);
  }

  const valor = useMemo(
    () => ({ reserva, iniciarReserva, definirFormulario, limparReserva }),
    [reserva]
  );

  return (
    <ReservaContext.Provider value={valor}>{children}</ReservaContext.Provider>
  );
}
