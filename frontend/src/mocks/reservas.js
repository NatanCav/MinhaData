// src/mocks/reservas.js
//
// Reservas mockadas do cliente autenticado. O back-end ainda só expõe
// POST /api/reservas e GET /api/reservas/:id (ver reservasController.js) —
// não existe endpoint de listagem por usuário nem de cancelamento. Este mock
// segue o mesmo formato que a API real já devolve para uma reserva, para que
// a troca futura por fetch não exija mudar o contrato consumido pela tela.
//
// Como cada usuário cadastrado recebe um id gerado em tempo de execução
// (crypto.randomUUID em authService.js), as reservas de exemplo são geradas
// na primeira consulta de cada usuário e mantidas em memória durante a
// sessão do app, para que uma ação como cancelar continue refletida nas
// próximas consultas.

import { PROPRIETARIO_ID_PADRAO } from "./proprietario";

const reservasPorUsuario = new Map();

function criarReservasIniciais(usuarioId) {
  return [
    {
      id: 1001,
      usuarioId,
      status: "confirmada",
      data: "2026-09-12",
      horarioInicio: "10:00",
      horarioFim: "18:00",
      nomeCliente: "Cliente",
      telefoneCliente: "(81) 90000-0000",
      emailCliente: "cliente@example.com",
      observacoes: null,
      createdAt: "2026-08-01T12:00:00.000Z",
      espaco: {
        id: 1,
        slug: "chacara-paraiso",
        nome: "Chácara Paraíso",
        unidadePreco: "dia",
        proprietarioId: PROPRIETARIO_ID_PADRAO,
      },
    },
    {
      id: 1002,
      usuarioId,
      status: "pendente",
      data: "2026-09-20",
      horarioInicio: "14:00",
      horarioFim: "16:00",
      nomeCliente: "Cliente",
      telefoneCliente: "(81) 90000-0000",
      emailCliente: "cliente@example.com",
      observacoes: null,
      createdAt: "2026-08-10T09:30:00.000Z",
      espaco: {
        id: 4,
        slug: "quadra-poliesportiva",
        nome: "Quadra Poliesportiva",
        unidadePreco: "hora",
        proprietarioId: PROPRIETARIO_ID_PADRAO,
      },
    },
    {
      id: 1003,
      usuarioId,
      status: "recusada",
      data: "2026-08-05",
      horarioInicio: "08:00",
      horarioFim: "22:00",
      nomeCliente: "Cliente",
      telefoneCliente: "(81) 90000-0000",
      emailCliente: "cliente@example.com",
      observacoes: null,
      createdAt: "2026-07-20T15:00:00.000Z",
      espaco: {
        id: 2,
        slug: "salao-de-festas",
        nome: "Salão de Festas",
        unidadePreco: "dia",
        proprietarioId: PROPRIETARIO_ID_PADRAO,
      },
    },
  ];
}

export function buscarReservasPorUsuario(usuarioId) {
  if (!reservasPorUsuario.has(usuarioId)) {
    reservasPorUsuario.set(usuarioId, criarReservasIniciais(usuarioId));
  }
  return reservasPorUsuario.get(usuarioId);
}

export function atualizarStatusReserva(usuarioId, reservaId, novoStatus) {
  const reservas = buscarReservasPorUsuario(usuarioId);
  const reserva = reservas.find((item) => item.id === reservaId);
  if (!reserva) return null;

  reserva.status = novoStatus;
  return reserva;
}

// Reservas do painel de gestão (visão do proprietário).
//
// O mock de reservas do cliente acima é isolado por usuário (Map, criado
// sob demanda no primeiro acesso daquele usuário) — não dá para "somar" as
// reservas de todos os clientes a partir dele, porque elas só existem em
// memória depois que o próprio cliente loga e visita "Minhas reservas".
// Como o back-end ainda não tem uma listagem de reservas por proprietário
// (ver reservasRoutes.js: só existem POST / e GET /:id), este é um dataset
// separado, representando reservas de vários clientes sobre os espaços do
// proprietário único do produto — para demonstrar o painel de forma
// realista mesmo sem nenhum cliente ter reservado nada na sessão atual.
const reservasDoSistema = [
  {
    id: 5001,
    status: "pendente",
    data: "2026-09-05",
    horarioInicio: "10:00",
    horarioFim: "18:00",
    nomeCliente: "Ana Souza",
    telefoneCliente: "(81) 98888-1001",
    emailCliente: "ana.souza@example.com",
    observacoes: "Aniversário de 15 anos, decoração própria.",
    createdAt: "2026-08-20T11:00:00.000Z",
    espaco: {
      id: 1,
      slug: "chacara-paraiso",
      nome: "Chácara Paraíso",
      unidadePreco: "dia",
      proprietarioId: PROPRIETARIO_ID_PADRAO,
    },
  },
  {
    id: 5002,
    status: "confirmada",
    data: "2026-08-30",
    horarioInicio: "09:00",
    horarioFim: "17:00",
    nomeCliente: "Marcos Vieira",
    telefoneCliente: "(81) 98888-1002",
    emailCliente: "marcos.vieira@example.com",
    observacoes: null,
    createdAt: "2026-08-05T09:00:00.000Z",
    espaco: {
      id: 1,
      slug: "chacara-paraiso",
      nome: "Chácara Paraíso",
      unidadePreco: "dia",
      proprietarioId: PROPRIETARIO_ID_PADRAO,
    },
  },
  {
    id: 5003,
    status: "pendente",
    data: "2026-09-10",
    horarioInicio: "18:00",
    horarioFim: "23:00",
    nomeCliente: "Beatriz Nunes",
    telefoneCliente: "(81) 98888-1003",
    emailCliente: "beatriz.nunes@example.com",
    observacoes: "Casamento, cerca de 120 convidados.",
    createdAt: "2026-08-22T14:20:00.000Z",
    espaco: {
      id: 2,
      slug: "salao-de-festas",
      nome: "Salão de Festas",
      unidadePreco: "dia",
      proprietarioId: PROPRIETARIO_ID_PADRAO,
    },
  },
  {
    id: 5004,
    status: "recusada",
    data: "2026-08-15",
    horarioInicio: "10:00",
    horarioFim: "02:00",
    nomeCliente: "Carlos Lima",
    telefoneCliente: "(81) 98888-1004",
    emailCliente: "carlos.lima@example.com",
    observacoes: null,
    createdAt: "2026-08-02T16:45:00.000Z",
    espaco: {
      id: 2,
      slug: "salao-de-festas",
      nome: "Salão de Festas",
      unidadePreco: "dia",
      proprietarioId: PROPRIETARIO_ID_PADRAO,
    },
  },
  {
    id: 5005,
    status: "confirmada",
    data: "2026-09-01",
    horarioInicio: "08:00",
    horarioFim: "22:00",
    nomeCliente: "Fernanda Alves",
    telefoneCliente: "(81) 98888-1005",
    emailCliente: "fernanda.alves@example.com",
    observacoes: null,
    createdAt: "2026-08-12T10:10:00.000Z",
    espaco: {
      id: 3,
      slug: "quiosque-premium",
      nome: "Quiosque Premium",
      unidadePreco: "dia",
      proprietarioId: PROPRIETARIO_ID_PADRAO,
    },
  },
  {
    id: 5006,
    status: "cancelada",
    data: "2026-08-20",
    horarioInicio: "08:00",
    horarioFim: "22:00",
    nomeCliente: "Rafael Costa",
    telefoneCliente: "(81) 98888-1006",
    emailCliente: "rafael.costa@example.com",
    observacoes: null,
    createdAt: "2026-08-01T08:30:00.000Z",
    espaco: {
      id: 3,
      slug: "quiosque-premium",
      nome: "Quiosque Premium",
      unidadePreco: "dia",
      proprietarioId: PROPRIETARIO_ID_PADRAO,
    },
  },
  {
    id: 5007,
    status: "pendente",
    data: "2026-08-28",
    horarioInicio: "14:00",
    horarioFim: "16:00",
    nomeCliente: "Juliana Pires",
    telefoneCliente: "(81) 98888-1007",
    emailCliente: "juliana.pires@example.com",
    observacoes: null,
    createdAt: "2026-08-24T13:00:00.000Z",
    espaco: {
      id: 4,
      slug: "quadra-poliesportiva",
      nome: "Quadra Poliesportiva",
      unidadePreco: "hora",
      proprietarioId: PROPRIETARIO_ID_PADRAO,
    },
  },
  {
    id: 5008,
    status: "confirmada",
    data: "2026-08-27",
    horarioInicio: "16:00",
    horarioFim: "18:00",
    nomeCliente: "Diego Martins",
    telefoneCliente: "(81) 98888-1008",
    emailCliente: "diego.martins@example.com",
    observacoes: null,
    createdAt: "2026-08-18T18:00:00.000Z",
    espaco: {
      id: 4,
      slug: "quadra-poliesportiva",
      nome: "Quadra Poliesportiva",
      unidadePreco: "hora",
      proprietarioId: PROPRIETARIO_ID_PADRAO,
    },
  },
];

export function buscarReservasDoProprietario(proprietarioId) {
  return reservasDoSistema.filter(
    (reserva) => reserva.espaco.proprietarioId === proprietarioId
  );
}

export function atualizarStatusReservaSistema(reservaId, novoStatus) {
  const reserva = reservasDoSistema.find((item) => item.id === reservaId);
  if (!reserva) return null;

  reserva.status = novoStatus;
  return reserva;
}
