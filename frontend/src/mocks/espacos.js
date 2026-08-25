// src/mocks/espacos.js
//
// Dados falsos que simulam a resposta da API do back-end.
// Este arquivo é o "contrato" que combinamos com o Pedro:
// a API deve devolver os espaços exatamente neste formato.
//
// O back-end já implementa GET /api/espacos e GET /api/espacos/:slug (ver
// backend/src/routes/espacosRoutes.js), seedados a partir deste mesmo
// arquivo (ver backend/prisma/seed.js) — por isso espacosService.getEspacos
// usa fetch de verdade, não este mock, para listagem. O que ainda não
// existe no back-end é criação/edição de espaço (POST/PUT), então as
// funções no fim deste arquivo simulam essa parte, em memória, para o
// painel de gestão do proprietário.

import { PROPRIETARIO_ID_PADRAO } from "./proprietario";

export const espacosMock = [
  {
    id: 1,
    slug: "chacara-paraiso",
    nome: "Chácara Paraíso",
    tipo: "Chácara",
    localizacao: "Gravatá, PE",
    descricao:
      "Um espaço completo para você curtir com sua família e amigos. Piscina, área gourmet, campo de futebol e muito mais.",
    preco: 700.0,
    unidadePreco: "dia", // "dia" | "hora"
    capacidade: 80,
    avaliacao: {
      nota: 4.9,
      totalAvaliacoes: 128,
    },
    imagemCapa:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    galeria: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
    ],
    comodidades: [
      { id: "capacidade", label: "Até 80 pessoas" },
      { id: "piscina", label: "Piscina" },
      { id: "churrasqueira", label: "Churrasqueira" },
      { id: "campo-futebol", label: "Campo de futebol" },
      { id: "wifi", label: "Wi-Fi" },
      { id: "estacionamento", label: "Estacionamento" },
    ],
    informacoes: [
      "Horário de funcionamento: 08:00 às 18:00",
      "Permitido som até 22:00",
      "Não é permitido animais",
      "Reserva mediante aprovação",
    ],
    disponivel: true,
  },
  {
    id: 2,
    slug: "salao-de-festas",
    nome: "Salão de Festas",
    tipo: "Salão de Festas",
    localizacao: "Caruaru, PE",
    descricao:
      "Ambiente climatizado e elegante, ideal para casamentos, aniversários e confraternizações.",
    preco: 1200.0,
    unidadePreco: "dia",
    capacidade: 150,
    avaliacao: {
      nota: 4.7,
      totalAvaliacoes: 86,
    },
    imagemCapa:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
    galeria: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
      "https://images.unsplash.com/photo-1470229722913-7ea0d7b3d1b3?w=800",
    ],
    comodidades: [
      { id: "capacidade", label: "Até 150 pessoas" },
      { id: "ar-condicionado", label: "Ar-condicionado" },
      { id: "som", label: "Sistema de som" },
      { id: "cozinha", label: "Cozinha industrial" },
      { id: "estacionamento", label: "Estacionamento" },
    ],
    informacoes: [
      "Horário de funcionamento: 10:00 às 02:00",
      "Buffet próprio ou terceirizado",
      "Reserva mediante aprovação",
    ],
    disponivel: true,
  },
  {
    id: 3,
    slug: "quiosque-premium",
    nome: "Quiosque Premium",
    tipo: "Quiosque",
    localizacao: "Bezerros, PE",
    descricao:
      "Espaço aconchegante à beira da piscina, perfeito para encontros menores e churrascos em família.",
    preco: 450.0,
    unidadePreco: "dia",
    capacidade: 40,
    avaliacao: {
      nota: 4.8,
      totalAvaliacoes: 54,
    },
    imagemCapa:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    galeria: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
      "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    ],
    comodidades: [
      { id: "capacidade", label: "Até 40 pessoas" },
      { id: "churrasqueira", label: "Churrasqueira" },
      { id: "piscina", label: "Piscina" },
      { id: "wifi", label: "Wi-Fi" },
    ],
    informacoes: [
      "Horário de funcionamento: 08:00 às 22:00",
      "Permitido animais de pequeno porte",
      "Reserva mediante aprovação",
    ],
    disponivel: true,
  },
  {
    id: 4,
    slug: "quadra-poliesportiva",
    nome: "Quadra Poliesportiva",
    tipo: "Quadra",
    localizacao: "Santa Cruz do Capibaribe, PE",
    descricao:
      "Quadra oficial com iluminação noturna para futebol, vôlei e basquete. Aluguel por hora.",
    preco: 200.0,
    unidadePreco: "hora",
    capacidade: 30,
    avaliacao: {
      nota: 4.6,
      totalAvaliacoes: 41,
    },
    imagemCapa:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    galeria: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
      "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=800",
      "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=800",
    ],
    comodidades: [
      { id: "esportes", label: "Futebol, vôlei e basquete" },
      { id: "iluminacao", label: "Iluminação noturna" },
      { id: "vestiario", label: "Vestiário" },
      { id: "estacionamento", label: "Estacionamento" },
    ],
    informacoes: [
      "Horário de funcionamento: 06:00 às 23:00",
      "Aluguel mínimo de 1 hora",
      "Confirmação imediata",
    ],
    disponivel: false,
  },
];

// Helper útil para a tela de detalhes: busca um espaço pelo slug da URL.
export function buscarEspacoPorSlug(slug) {
  return espacosMock.find((espaco) => espaco.slug === slug);
}

// --- Mock de escrita para o painel de gestão -------------------------------
//
// Enquanto o back-end não expõe criação/edição de espaço, mantemos aqui, em
// memória, os espaços criados pelo proprietário nesta sessão e os campos
// alterados em espaços já existentes (vindos do back-end via fetch). O
// espacosService.js mescla esse estado com a lista real ao montar a visão
// "meus espaços" do painel. Por não haver persistência real, o que for
// criado/editado aqui não aparece na vitrine pública (que só lê da API).

let proximoIdEspacoMock = 1000;
const espacosCriadosPeloProprietario = [];
const edicoesPorSlug = new Map();

const REGEX_DIACRITICOS = /[̀-ͯ]/g;

function gerarSlug(nome) {
  return nome
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(REGEX_DIACRITICOS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function slugJaExiste(slug, espacosReais) {
  return (
    espacosReais.some((espaco) => espaco.slug === slug) ||
    espacosCriadosPeloProprietario.some((espaco) => espaco.slug === slug)
  );
}

export function criarEspacoMock(dados, espacosReais = espacosMock) {
  const slugBase = gerarSlug(dados.nome);
  let slug = slugBase;
  let sufixo = 2;
  while (slugJaExiste(slug, espacosReais)) {
    slug = `${slugBase}-${sufixo}`;
    sufixo += 1;
  }

  const novoEspaco = {
    avaliacao: { nota: 0, totalAvaliacoes: 0 },
    galeria: dados.imagemCapa ? [dados.imagemCapa] : [],
    comodidades: [],
    informacoes: [],
    ...dados,
    id: proximoIdEspacoMock++,
    slug,
    proprietarioId: PROPRIETARIO_ID_PADRAO,
  };

  espacosCriadosPeloProprietario.push(novoEspaco);
  return novoEspaco;
}

export function atualizarEspacoMock(slug, dados) {
  const espacoCriado = espacosCriadosPeloProprietario.find(
    (espaco) => espaco.slug === slug
  );
  if (espacoCriado) {
    Object.assign(espacoCriado, dados);
    return espacoCriado;
  }

  const patchAtual = edicoesPorSlug.get(slug) || {};
  const patchNovo = { ...patchAtual, ...dados };
  edicoesPorSlug.set(slug, patchNovo);
  return patchNovo;
}

// Mescla a lista real (vinda do back-end) com criações/edições feitas no
// painel nesta sessão, marcando todos com o único proprietário do produto.
export function listarEspacosDoProprietario(espacosReais) {
  const reaisComEdicoes = espacosReais.map((espaco) => ({
    ...espaco,
    proprietarioId: PROPRIETARIO_ID_PADRAO,
    ...(edicoesPorSlug.get(espaco.slug) || {}),
  }));

  return [...reaisComEdicoes, ...espacosCriadosPeloProprietario];
}

export function buscarEspacoDoProprietarioPorSlug(slug, espacosReais) {
  return listarEspacosDoProprietario(espacosReais).find(
    (espaco) => espaco.slug === slug
  );
}
