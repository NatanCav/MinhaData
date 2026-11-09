import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/AppError.js";

const REGEX_DIACRITICOS = /[̀-ͯ]/g;

export function gerarSlugBase(nome) {
  return nome
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(REGEX_DIACRITICOS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function gerarSlugUnico(nome) {
  const slugBase = gerarSlugBase(nome);
  let slug = slugBase;
  let sufixo = 2;

  while (await prisma.espaco.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${sufixo}`;
    sufixo += 1;
  }

  return slug;
}

function paraApi(espaco) {
  return {
    id: espaco.id,
    slug: espaco.slug,
    nome: espaco.nome,
    tipo: espaco.tipo,
    localizacao: espaco.localizacao,
    descricao: espaco.descricao,
    preco: espaco.preco,
    unidadePreco: espaco.unidadePreco,
    capacidade: espaco.capacidade,
    avaliacao: {
      nota: espaco.avaliacaoNota,
      totalAvaliacoes: espaco.avaliacaoTotalAvaliacoes,
    },
    imagemCapa: espaco.imagemCapa,
    galeria: espaco.galeria,
    comodidades: espaco.comodidades,
    informacoes: espaco.informacoes,
    disponivel: espaco.disponivel,
  };
}

export async function listarEspacos() {
  const espacos = await prisma.espaco.findMany({ orderBy: { id: "asc" } });
  return espacos.map(paraApi);
}

export async function buscarEspacoPorSlug(slug) {
  const espaco = await prisma.espaco.findUnique({ where: { slug } });
  if (!espaco) {
    throw new AppError("Espaço não encontrado.", 404);
  }
  return paraApi(espaco);
}

export async function buscarEspacoEntidadePorSlug(slug) {
  const espaco = await prisma.espaco.findUnique({ where: { slug } });
  if (!espaco) {
    throw new AppError("Espaço não encontrado.", 404);
  }
  return espaco;
}

function validarDadosEspaco(dados) {
  if (!dados.nome || !String(dados.nome).trim()) {
    throw new AppError("Informe o nome do espaço.");
  }
  if (!dados.tipo || !String(dados.tipo).trim()) {
    throw new AppError("Informe o tipo do espaço.");
  }
  if (!dados.localizacao || !String(dados.localizacao).trim()) {
    throw new AppError("Informe a localização.");
  }
  if (!dados.descricao || !String(dados.descricao).trim()) {
    throw new AppError("Descreva o espaço para os clientes.");
  }

  const preco = Number(dados.preco);
  if (!dados.preco || Number.isNaN(preco) || preco <= 0) {
    throw new AppError("Informe um preço válido.");
  }

  const capacidade = Number(dados.capacidade);
  if (!dados.capacidade || Number.isNaN(capacidade) || capacidade <= 0) {
    throw new AppError("Informe uma capacidade válida.");
  }

  if (dados.unidadePreco !== "dia" && dados.unidadePreco !== "hora") {
    throw new AppError("Unidade de preço inválida.");
  }
}

export function normalizarComodidades(comodidades) {
  if (!Array.isArray(comodidades)) return [];
  return comodidades
    .filter((item) => item && typeof item.label === "string" && item.label.trim())
    .map((item) => ({ id: String(item.id || item.label), label: item.label.trim() }));
}

export function normalizarInformacoes(informacoes) {
  if (!Array.isArray(informacoes)) return [];
  return informacoes.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim());
}

export async function criarEspaco(dados) {
  validarDadosEspaco(dados);
  const slug = await gerarSlugUnico(dados.nome);

  const espaco = await prisma.espaco.create({
    data: {
      nome: dados.nome.trim(),
      slug,
      tipo: dados.tipo.trim(),
      localizacao: dados.localizacao.trim(),
      descricao: dados.descricao.trim(),
      preco: Number(dados.preco),
      unidadePreco: dados.unidadePreco,
      capacidade: Number(dados.capacidade),
      imagemCapa: dados.imagemCapa || null,
      galeria: Array.isArray(dados.galeria) ? dados.galeria : [],
      comodidades: normalizarComodidades(dados.comodidades),
      informacoes: normalizarInformacoes(dados.informacoes),
      disponivel: dados.disponivel ?? true,
    },
  });

  return paraApi(espaco);
}

export async function atualizarEspaco(slug, dados) {
  validarDadosEspaco(dados);
  await buscarEspacoEntidadePorSlug(slug);

  const espaco = await prisma.espaco.update({
    where: { slug },
    data: {
      nome: dados.nome.trim(),
      tipo: dados.tipo.trim(),
      localizacao: dados.localizacao.trim(),
      descricao: dados.descricao.trim(),
      preco: Number(dados.preco),
      unidadePreco: dados.unidadePreco,
      capacidade: Number(dados.capacidade),
      imagemCapa: dados.imagemCapa || null,
      galeria: Array.isArray(dados.galeria) ? dados.galeria : [],
      comodidades: normalizarComodidades(dados.comodidades),
      informacoes: normalizarInformacoes(dados.informacoes),
      disponivel: dados.disponivel ?? true,
    },
  });

  return paraApi(espaco);
}
