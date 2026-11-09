import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/AppError.js";
import { cpfValido, normalizarCpf } from "../lib/cpf.js";
import { buscarEspacoEntidadePorSlug } from "./espacosService.js";
import { enviarEmail } from "./emailService.js";
import { enviarWhatsapp } from "./whatsappService.js";

const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_HORARIO = /^([01]\d|2[0-3]):[0-5]\d$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarData(data) {
  if (!REGEX_DATA.test(data)) return false;
  const [ano, mes, dia] = data.split("-").map(Number);
  const dataConvertida = new Date(ano, mes - 1, dia);
  return (
    dataConvertida.getFullYear() === ano &&
    dataConvertida.getMonth() === mes - 1 &&
    dataConvertida.getDate() === dia
  );
}

function validarPayload({
  espacoSlug,
  data,
  horarioInicio,
  horarioFim,
  nomeCliente,
  telefoneCliente,
  emailCliente,
  cpfCliente,
}) {
  if (!espacoSlug || typeof espacoSlug !== "string") {
    throw new AppError("Informe o espaço da reserva.");
  }
  if (!data || !validarData(data)) {
    throw new AppError("Informe uma data válida (formato AAAA-MM-DD).");
  }
  if (!horarioInicio || !REGEX_HORARIO.test(horarioInicio)) {
    throw new AppError("Informe um horário de início válido (formato HH:MM).");
  }
  if (!horarioFim || !REGEX_HORARIO.test(horarioFim)) {
    throw new AppError("Informe um horário de término válido (formato HH:MM).");
  }
  if (horarioFim <= horarioInicio) {
    throw new AppError("O horário final deve ser depois do horário inicial.");
  }
  if (!nomeCliente || !nomeCliente.trim()) {
    throw new AppError("Informe o nome do cliente.");
  }
  if (!telefoneCliente || !telefoneCliente.trim()) {
    throw new AppError("Informe o telefone do cliente.");
  }
  if (!emailCliente || !REGEX_EMAIL.test(emailCliente.trim())) {
    throw new AppError("Informe um e-mail válido.");
  }
  if (!cpfCliente || !cpfValido(cpfCliente)) {
    throw new AppError("Informe um CPF válido para identificação no contato com o estabelecimento.");
  }
}

export function horariosSeSobrepoe(inicioA, fimA, inicioB, fimB) {
  return inicioA < fimB && fimA > inicioB;
}

async function garantirSemConflito({ espacoId, data, horarioInicio, horarioFim }) {
  const reservasNaData = await prisma.reserva.findMany({
    where: {
      espacoId,
      data,
      status: { in: ["pendente", "confirmada"] },
    },
  });

  const haConflito = reservasNaData.some((reserva) =>
    horariosSeSobrepoe(horarioInicio, horarioFim, reserva.horarioInicio, reserva.horarioFim)
  );

  if (haConflito) {
    throw new AppError(
      "Já existe uma reserva para esse espaço nesta data e horário.",
      409
    );
  }
}

function paraApi(reserva) {
  return {
    id: reserva.id,
    status: reserva.status,
    data: reserva.data,
    horarioInicio: reserva.horarioInicio,
    horarioFim: reserva.horarioFim,
    nomeCliente: reserva.nomeCliente,
    telefoneCliente: reserva.telefoneCliente,
    emailCliente: reserva.emailCliente,
    cpfCliente: reserva.cpfCliente,
    observacoes: reserva.observacoes,
    observacoesProprietario: reserva.observacoesProprietario,
    createdAt: reserva.createdAt,
    espaco: {
      id: reserva.espaco.id,
      slug: reserva.espaco.slug,
      nome: reserva.espaco.nome,
      unidadePreco: reserva.espaco.unidadePreco,
    },
  };
}

export async function criarReserva(userId, payload) {
  validarPayload(payload);

  // Reservar não exige conta — userId só existe quando o cliente estava
  // logado no momento da reserva (sessão opcional, ver autenticarOpcional).
  let usuario = null;
  if (userId) {
    usuario = await prisma.user.findUnique({ where: { id: userId } });
    if (!usuario) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    if (usuario.tipoConta === "PJ" && !usuario.doisFatoresAtivo) {
      throw new AppError(
        "Ative a autenticação de dois fatores na sua conta antes de reservar como pessoa jurídica.",
        403
      );
    }
  }

  const espaco = await buscarEspacoEntidadePorSlug(payload.espacoSlug);

  if (!espaco.disponivel) {
    throw new AppError("Este espaço não está disponível para reservas.", 409);
  }

  const dadosReserva = {
    data: payload.data,
    horarioInicio: payload.horarioInicio,
    horarioFim: payload.horarioFim,
  };

  await garantirSemConflito({ espacoId: espaco.id, ...dadosReserva });

  const cpfClienteNormalizado = normalizarCpf(payload.cpfCliente);

  if (usuario) {
    if (usuario.cpf && usuario.cpf !== cpfClienteNormalizado) {
      throw new AppError("O CPF informado não corresponde ao CPF já registrado nesta conta.", 409);
    }

    if (!usuario.cpf) {
      const cpfEmUso = await prisma.user.findFirst({
        where: { cpf: cpfClienteNormalizado, NOT: { id: userId } },
      });
      if (cpfEmUso) {
        throw new AppError("Este CPF já está associado a outra conta.", 409);
      }
    }
  }

  const operacoes = [
    prisma.reserva.create({
      data: {
        ...dadosReserva,
        userId: usuario ? userId : null,
        espacoId: espaco.id,
        nomeCliente: payload.nomeCliente.trim(),
        telefoneCliente: payload.telefoneCliente.trim(),
        emailCliente: payload.emailCliente.trim(),
        cpfCliente: cpfClienteNormalizado,
        observacoes: payload.observacoes?.trim() || null,
      },
      include: { espaco: true },
    }),
  ];

  if (usuario) {
    operacoes.push(
      prisma.user.update({
        where: { id: userId },
        data: { cpf: cpfClienteNormalizado },
      })
    );
  }

  const [reserva] = await prisma.$transaction(operacoes);

  return paraApi(reserva);
}

async function ehProprietario(usuarioId) {
  const usuario = await prisma.user.findUnique({
    where: { id: usuarioId },
    select: { role: true },
  });
  return usuario?.role === "PROPRIETARIO";
}

export async function buscarReservaPorId(id, usuarioId) {
  const idNumerico = Number(id);
  if (!Number.isInteger(idNumerico)) {
    throw new AppError("Identificador de reserva inválido.");
  }

  const reserva = await prisma.reserva.findUnique({
    where: { id: idNumerico },
    include: { espaco: true },
  });

  if (!reserva) {
    throw new AppError("Reserva não encontrada.", 404);
  }

  if (reserva.userId !== usuarioId && !(await ehProprietario(usuarioId))) {
    throw new AppError("Você não tem permissão para ver esta reserva.", 403);
  }

  return paraApi(reserva);
}

export async function listarTodasReservas() {
  const reservas = await prisma.reserva.findMany({
    include: { espaco: true },
    orderBy: { createdAt: "desc" },
  });
  return reservas.map(paraApi);
}

export async function listarReservasDoUsuario(usuarioId) {
  const reservas = await prisma.reserva.findMany({
    where: { userId: usuarioId },
    include: { espaco: true },
    orderBy: { createdAt: "desc" },
  });
  return reservas.map(paraApi);
}

const STATUS_VALIDOS = ["pendente", "confirmada", "recusada", "cancelada"];

// Mapa: novo status -> lista de status de origem a partir dos quais essa
// transição é permitida para cada papel.
const TRANSICOES_PROPRIETARIO = {
  confirmada: ["pendente"],
  recusada: ["pendente"],
  cancelada: ["pendente", "confirmada"],
};

const TRANSICOES_CLIENTE = {
  cancelada: ["pendente", "confirmada"],
};

const MENSAGENS_STATUS_CLIENTE = {
  confirmada: "foi confirmada",
  recusada: "foi recusada",
  cancelada: "foi cancelada pelo estabelecimento",
};

// Decide se uma transição de status é permitida, sem tocar no banco —
// mantido puro para ser testável isoladamente (ver reservasService.test.js).
export function avaliarTransicaoStatus({ proprietario, donoDaReserva, novoStatus, statusAtual }) {
  if (!STATUS_VALIDOS.includes(novoStatus)) {
    return { permitido: false, motivo: "status_invalido" };
  }

  let transicoesPermitidas;
  if (proprietario) {
    transicoesPermitidas = TRANSICOES_PROPRIETARIO;
  } else if (donoDaReserva) {
    transicoesPermitidas = TRANSICOES_CLIENTE;
  } else {
    return { permitido: false, motivo: "sem_acesso" };
  }

  if (!(novoStatus in transicoesPermitidas)) {
    return { permitido: false, motivo: "sem_permissao" };
  }

  if (!transicoesPermitidas[novoStatus].includes(statusAtual)) {
    return { permitido: false, motivo: "transicao_invalida" };
  }

  return { permitido: true };
}

export async function atualizarStatusReserva(usuarioId, id, novoStatus) {
  const idNumerico = Number(id);
  if (!Number.isInteger(idNumerico)) {
    throw new AppError("Identificador de reserva inválido.");
  }

  const reserva = await prisma.reserva.findUnique({ where: { id: idNumerico } });
  if (!reserva) {
    throw new AppError("Reserva não encontrada.", 404);
  }

  const proprietario = await ehProprietario(usuarioId);
  const donoDaReserva = reserva.userId === usuarioId;

  const avaliacao = avaliarTransicaoStatus({
    proprietario,
    donoDaReserva,
    novoStatus,
    statusAtual: reserva.status,
  });

  if (!avaliacao.permitido) {
    if (avaliacao.motivo === "status_invalido") {
      throw new AppError("Status inválido.");
    }
    if (avaliacao.motivo === "sem_acesso") {
      throw new AppError("Você não tem permissão para alterar esta reserva.", 403);
    }
    if (avaliacao.motivo === "sem_permissao") {
      throw new AppError(
        "Você não tem permissão para alterar esta reserva para este status.",
        403
      );
    }
    throw new AppError(
      "Esta alteração de status não é permitida para o estado atual da reserva.",
      409
    );
  }

  const reservaAtualizada = await prisma.reserva.update({
    where: { id: idNumerico },
    data: { status: novoStatus },
    include: { espaco: true },
  });

  // Só notifica o cliente quando é o proprietário quem muda o status — se o
  // próprio cliente cancelou a reserva, ele já sabe, não precisa de e-mail.
  if (proprietario && novoStatus in MENSAGENS_STATUS_CLIENTE) {
    await enviarEmail(
      reservaAtualizada.emailCliente,
      `Sua reserva em ${reservaAtualizada.espaco.nome} ${MENSAGENS_STATUS_CLIENTE[novoStatus]}`,
      `Olá, ${reservaAtualizada.nomeCliente}!\n\n` +
        `Sua reserva ${MENSAGENS_STATUS_CLIENTE[novoStatus]}.\n\n` +
        `Espaço: ${reservaAtualizada.espaco.nome}\n` +
        `Data: ${reservaAtualizada.data}\n` +
        `Horário: ${reservaAtualizada.horarioInicio} às ${reservaAtualizada.horarioFim}\n\n` +
        "Equipe MinhaData."
    );

    await enviarWhatsapp(reservaAtualizada.telefoneCliente, [
      reservaAtualizada.nomeCliente,
      reservaAtualizada.espaco.nome,
      MENSAGENS_STATUS_CLIENTE[novoStatus],
      `${reservaAtualizada.data} às ${reservaAtualizada.horarioInicio}`,
    ]);
  }

  return paraApi(reservaAtualizada);
}

export async function atualizarObservacoesProprietario(usuarioId, id, observacoes) {
  if (!(await ehProprietario(usuarioId))) {
    throw new AppError("Você não tem permissão para alterar esta reserva.", 403);
  }

  const idNumerico = Number(id);
  if (!Number.isInteger(idNumerico)) {
    throw new AppError("Identificador de reserva inválido.");
  }

  const reserva = await prisma.reserva.findUnique({ where: { id: idNumerico } });
  if (!reserva) {
    throw new AppError("Reserva não encontrada.", 404);
  }

  const reservaAtualizada = await prisma.reserva.update({
    where: { id: idNumerico },
    data: { observacoesProprietario: String(observacoes ?? "").trim() || null },
    include: { espaco: true },
  });

  return paraApi(reservaAtualizada);
}
