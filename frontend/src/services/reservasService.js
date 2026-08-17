// src/services/reservasService.js

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
