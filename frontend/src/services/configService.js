// src/services/configService.js
// Configurações públicas do negócio, sem autenticação.

export async function getContatosWhatsapp() {
  const res = await fetch("/api/config/contatos-whatsapp");
  if (!res.ok) return [];
  const corpo = await res.json().catch(() => null);
  return Array.isArray(corpo?.contatos) ? corpo.contatos : [];
}
