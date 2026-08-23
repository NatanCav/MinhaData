// src/services/reservasService.js
import { obterSessao } from "./authService";
import {
  atualizarStatusReserva,
  buscarReservasPorUsuario,
} from "../mocks/reservas";

const STATUS_CANCELAVEIS = ["pendente", "confirmada"];

export function podeCancelarReserva(status) {
  return STATUS_CANCELAVEIS.includes(status);
}

export async function criarReserva(dadosReserva) {
  const res = await fetch("/api/reservas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosReserva),
  });

  const corpo = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(corpo?.mensagem || "Não foi possível concluir a reserva.");
  }

  return corpo;
}

export async function getReservaPorId(id) {
  const res = await fetch(`/api/reservas/${id}`);
  if (!res.ok) throw new Error("Reserva não encontrada");
  return res.json();
}

// O back-end ainda não expõe um endpoint de listagem de reservas por
// usuário — mantido como mock até essa rota existir. A implementação
// simula o comportamento assíncrono de uma chamada real para já testarmos
// os estados de loading da tela.
export async function getReservasDoUsuario() {
  const sessao = obterSessao();

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sessao ? buscarReservasPorUsuario(sessao.id) : []);
    }, 400);
  });
}

// O back-end ainda não expõe um endpoint de cancelamento de reserva —
// mantido como mock até essa rota existir.
export async function cancelarReserva(id) {
  const sessao = obterSessao();

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const reserva = sessao
        ? buscarReservasPorUsuario(sessao.id).find((item) => item.id === id)
        : null;

      if (!reserva) {
        reject(new Error("Reserva não encontrada."));
        return;
      }

      if (!podeCancelarReserva(reserva.status)) {
        reject(new Error("Esta reserva não pode mais ser cancelada."));
        return;
      }

      resolve(atualizarStatusReserva(sessao.id, id, "cancelada"));
    }, 400);
  });
}

// Quando o Pedro entregar as rotas, este arquivo troca as duas funções
// acima por algo como:
//
// export async function getReservasDoUsuario() {
//   const res = await fetch("/api/reservas/minhas");
//   if (!res.ok) throw new Error("Não foi possível carregar suas reservas.");
//   return res.json();
// }
//
// export async function cancelarReserva(id) {
//   const res = await fetch(`/api/reservas/${id}/cancelar`, { method: "PATCH" });
//   if (!res.ok) throw new Error("Não foi possível cancelar esta reserva.");
//   return res.json();
// }
