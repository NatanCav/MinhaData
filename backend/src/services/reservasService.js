import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/AppError.js";
import { buscarEspacoEntidadePorSlug } from "./espacosService.js";

const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_HORARIO = /^([01]\d|2[0-3]):[0-5]\d$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const USUARIO_TESTE_ID = Number(process.env.USUARIO_TESTE_ID ?? 1);

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
}

async function garantirSemConflito({ espacoId, data, horarioInicio, horarioFim }) {
  const reservasNaData = await prisma.reserva.findMany({
    where: {
      espacoId,
      data,
      status: { in: ["pendente", "confirmada"] },
    },
  });

  const haConflito = reservasNaData.some(
    (reserva) =>
      horarioInicio < reserva.horarioFim && horarioFim > reserva.horarioInicio
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
    observacoes: reserva.observacoes,
    createdAt: reserva.createdAt,
    espaco: {
      id: reserva.espaco.id,
      slug: reserva.espaco.slug,
      nome: reserva.espaco.nome,
      unidadePreco: reserva.espaco.unidadePreco,
    },
  };
}

export async function criarReserva(payload) {
  validarPayload(payload);

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

  const reserva = await prisma.reserva.create({
    data: {
      ...dadosReserva,
      userId: USUARIO_TESTE_ID,
      espacoId: espaco.id,
      nomeCliente: payload.nomeCliente.trim(),
      telefoneCliente: payload.telefoneCliente.trim(),
      emailCliente: payload.emailCliente.trim(),
      observacoes: payload.observacoes?.trim() || null,
    },
    include: { espaco: true },
  });

  return paraApi(reserva);
}

export async function buscarReservaPorId(id) {
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

  return paraApi(reserva);
}
