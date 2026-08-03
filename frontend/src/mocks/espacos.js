// src/mocks/espacos.js
//
// Dados falsos que simulam a resposta da API do back-end.
// Este arquivo é o "contrato" que combinamos com o Pedro:
// a API deve devolver os espaços exatamente neste formato.
//
// Quando a API real estiver pronta, este arquivo pode ser apagado —
// só o espacosService.js precisa mudar.

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
