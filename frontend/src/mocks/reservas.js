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
