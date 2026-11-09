import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/AppError.js";
import { cpfValido, normalizarCpf } from "../lib/cpf.js";
import { buscarEspacoEntidadePorSlug } from "./espacosService.js";
import { enviarEmail } from "./emailService.js";
import { enviarWhatsapp } from "./whatsappService.js";

const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_HORARIO = /^([01]\d|2[0-3]):[0-5]\d$/;

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

function validarDatas(datas) {
  if (!Array.isArray(datas) || datas.length === 0) {
    throw new AppError("Selecione ao menos uma data.");
  }
  if (new Set(datas).size !== datas.length) {
    throw new AppError("Datas repetidas não são permitidas.");
  }
  for (const data of datas) {
    if (!validarData(data)) {
      throw new AppError("Informe datas válidas (formato AAAA-MM-DD).");
    }
  }
}

function validarCamposComuns({ espacoSlug, horarioInicio, horarioFim, nomeCliente, telefoneCliente }) {
  if (!espacoSlug || typeof espacoSlug !== "string") {
    throw new AppError("Informe o espaço da reserva.");
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
}

// Validação do fluxo público (cliente reservando pelo site): CPF é
// obrigatório, para identificação junto ao estabelecimento.
function validarPayload(payload) {
  validarCamposComuns(payload);
  validarDatas(payload.datas);
  if (!payload.cpfCliente || !cpfValido(payload.cpfCliente)) {
    throw new AppError("Informe um CPF válido para identificação no contato com o estabelecimento.");
  }
}

// Validação do cadastro manual (proprietário registrando uma reserva feita
// por fora, ex. Instagram/WhatsApp): CPF é opcional, mas se informado tem
// que ser válido.
function validarPayloadManual(payload) {
  validarCamposComuns(payload);
  validarDatas(payload.datas);
  if (payload.cpfCliente && !cpfValido(payload.cpfCliente)) {
    throw new AppError("CPF inválido.");
  }
}

export function horariosSeSobrepoe(inicioA, fimA, inicioB, fimB) {
  return inicioA < fimB && fimA > inicioB;
}

async function encontrarDatasComConflito({ espacoId, datas, horarioInicio, horarioFim }) {
  const conflitos = [];

  for (const data of datas) {
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

    if (haConflito) conflitos.push(data);
  }

  return conflitos;
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

// Núcleo comum de criação: valida disponibilidade do espaço, checa conflito
// em todas as datas pedidas (tudo ou nada — se qualquer uma conflitar,
// nenhuma reserva é criada) e grava uma linha de Reserva por data.
async function criarReservasParaDatas({
  espacoSlug,
  datas,
  horarioInicio,
  horarioFim,
  nomeCliente,
  telefoneCliente,
  emailCliente,
  cpfCliente,
  observacoes,
  userId,
  status,
}) {
  const espaco = await buscarEspacoEntidadePorSlug(espacoSlug);

  if (!espaco.disponivel) {
    throw new AppError("Este espaço não está disponível para reservas.", 409);
  }

  const conflitos = await encontrarDatasComConflito({
    espacoId: espaco.id,
    datas,
    horarioInicio,
    horarioFim,
  });

  if (conflitos.length > 0) {
    throw new AppError(
      `Já existe reserva para esse espaço e horário em: ${conflitos.join(", ")}.`,
      409
    );
  }

  const cpfNormalizado = cpfCliente ? normalizarCpf(cpfCliente) : null;

  const reservas = await prisma.$transaction(
    datas.map((data) =>
      prisma.reserva.create({
        data: {
          data,
          horarioInicio,
          horarioFim,
          status,
          userId: userId || null,
          espacoId: espaco.id,
          nomeCliente: nomeCliente.trim(),
          telefoneCliente: telefoneCliente.trim(),
          emailCliente: emailCliente?.trim() || null,
          cpfCliente: cpfNormalizado,
          observacoes: observacoes?.trim() || null,
        },
        include: { espaco: true },
      })
    )
  );

  return reservas.map(paraApi);
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

  const reservas = await criarReservasParaDatas({
    espacoSlug: payload.espacoSlug,
    datas: payload.datas,
    horarioInicio: payload.horarioInicio,
    horarioFim: payload.horarioFim,
    nomeCliente: payload.nomeCliente,
    telefoneCliente: payload.telefoneCliente,
    emailCliente: payload.emailCliente,
    cpfCliente: payload.cpfCliente,
    observacoes: payload.observacoes,
    userId,
    status: "pendente",
  });

  if (usuario) {
    await prisma.user.update({
      where: { id: userId },
      data: { cpf: cpfClienteNormalizado },
    });
  }

  return reservas;
}

// Cadastro manual: o proprietário registra uma reserva combinada fora do
// site (Instagram, WhatsApp pessoal, telefone). Entra direto como
// "confirmada" — já é um acordo fechado, não uma solicitação pendente — e
// não dispara nenhuma notificação ao cliente.
export async function criarReservaManual(usuarioId, payload) {
  if (!(await ehProprietario(usuarioId))) {
    throw new AppError("Apenas o proprietário pode cadastrar reservas manualmente.", 403);
  }

  validarPayloadManual(payload);

  return criarReservasParaDatas({
    espacoSlug: payload.espacoSlug,
    datas: payload.datas,
    horarioInicio: payload.horarioInicio,
    horarioFim: payload.horarioFim,
    nomeCliente: payload.nomeCliente,
    telefoneCliente: payload.telefoneCliente,
    emailCliente: payload.emailCliente,
    cpfCliente: payload.cpfCliente,
    observacoes: payload.observacoes,
    userId: null,
    status: "confirmada",
  });
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
    if (reservaAtualizada.emailCliente) {
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
    }

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
