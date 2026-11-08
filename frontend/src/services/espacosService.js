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

// Produto tem um único proprietário — todos os espaços da API são "dele".
export async function getEspacosDoProprietario() {
  return getEspacos();
}

export async function getEspacoDoProprietarioPorSlug(slug) {
  return getEspacoPorSlug(slug);
}

export async function criarEspaco(dados) {
  const res = await fetch("/api/espacos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(dados),
  });

  const corpo = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(corpo?.mensagem || "Não foi possível cadastrar o espaço.");
  }

  return corpo;
}

export async function atualizarEspaco(slug, dados) {
  const res = await fetch(`/api/espacos/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(dados),
  });

  const corpo = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(corpo?.mensagem || "Não foi possível atualizar o espaço.");
  }

  return corpo;
}
