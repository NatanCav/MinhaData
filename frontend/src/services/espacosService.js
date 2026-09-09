// src/services/espacosService.js
import { obterSessao } from "./authService";
import {
  atualizarEspacoMock,
  buscarEspacoDoProprietarioPorSlug,
  criarEspacoMock,
  listarEspacosDoProprietario,
} from "../mocks/espacos";

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

// O back-end ainda não expõe criação/edição de espaço (POST/PUT em
// /api/espacos — ver backend/src/routes/espacosRoutes.js), então essas
// funções mesclam a listagem real (fetch) com um mock em memória para o
// painel de gestão do proprietário (ver mocks/espacos.js).
export async function getEspacosDoProprietario() {
  const sessao = obterSessao();
  const espacosReais = await getEspacos();
  const espacos = listarEspacosDoProprietario(espacosReais);
  return sessao
    ? espacos.filter((espaco) => espaco.proprietarioId === sessao.id)
    : [];
}

export async function getEspacoDoProprietarioPorSlug(slug) {
  const sessao = obterSessao();
  const espacosReais = await getEspacos();
  const espaco = buscarEspacoDoProprietarioPorSlug(slug, espacosReais);
  if (!espaco || !sessao || espaco.proprietarioId !== sessao.id) {
    throw new Error("Espaço não encontrado.");
  }
  return espaco;
}

export async function criarEspaco(dados) {
  const espacosReais = await getEspacos();
  return new Promise((resolve) => {
    setTimeout(() => resolve(criarEspacoMock(dados, espacosReais)), 500);
  });
}

export async function atualizarEspaco(slug, dados) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(atualizarEspacoMock(slug, dados)), 500);
  });
}
