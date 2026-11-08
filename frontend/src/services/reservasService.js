// src/services/reservasService.js

const STATUS_CANCELAVEIS = ["pendente", "confirmada"];

export function podeCancelarReserva(status) {
  return STATUS_CANCELAVEIS.includes(status);
}

async function requisitar(caminho, opcoes = {}) {
  const res = await fetch(`/api/reservas${caminho}`, {
    method: opcoes.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
  });

  const corpo = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(corpo?.mensagem || "Não foi possível concluir a operação.");
  }

  return corpo;
}

export async function criarReserva(dadosReserva) {
  return requisitar("", { method: "POST", body: dadosReserva });
}

export async function getReservaPorId(id) {
  return requisitar(`/${id}`);
}

export async function getReservasDoUsuario() {
  return requisitar("/minhas");
}

export async function cancelarReserva(id) {
  return requisitar(`/${id}/status`, { method: "PATCH", body: { status: "cancelada" } });
}

export async function getReservasDoProprietario() {
  return requisitar("");
}

export async function aprovarReserva(id) {
  return requisitar(`/${id}/status`, { method: "PATCH", body: { status: "confirmada" } });
}

export async function recusarReserva(id) {
  return requisitar(`/${id}/status`, { method: "PATCH", body: { status: "recusada" } });
}

export async function cancelarReservaProprietario(id) {
  return requisitar(`/${id}/status`, { method: "PATCH", body: { status: "cancelada" } });
}
