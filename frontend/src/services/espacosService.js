// src/services/espacosService.js

export async function getEspacos() {
  const res = await fetch("/api/espacos");
  if (!res.ok) throw new Error("Erro ao buscar espaços");
  return res.json();
}

export async function getEspacoPorSlug(slug) {
  const res = await fetch(`/api/espacos/${slug}`);
  if (!res.ok) throw new Error("Espaço não encontrado");
  return res.json();
}
