// src/services/configService.js
// Configurações públicas do negócio, sem autenticação.

export async function getWhatsappContato() {
  const res = await fetch("/api/config/whatsapp-contato");
  if (!res.ok) return null;
  const corpo = await res.json().catch(() => null);
  return corpo?.whatsapp || null;
}
