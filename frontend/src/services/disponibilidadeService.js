// src/services/disponibilidadeService.js

export async function getDisponibilidade(slug) {
  const res = await fetch(`/api/espacos/${slug}/disponibilidade`);
  if (!res.ok) throw new Error("Erro ao buscar disponibilidade");
  return res.json();
}
