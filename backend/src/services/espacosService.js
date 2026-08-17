import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/AppError.js";

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
