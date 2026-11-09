import * as reservasService from "../services/reservasService.js";

export async function criar(req, res, next) {
  try {
    const reserva = await reservasService.criarReserva(req.usuarioId, req.body ?? {});
    res.status(201).json(reserva);
  } catch (erro) {
    next(erro);
  }
}

export async function criarManual(req, res, next) {
  try {
    const reservas = await reservasService.criarReservaManual(req.usuarioId, req.body ?? {});
    res.status(201).json(reservas);
  } catch (erro) {
    next(erro);
  }
}

export async function obterPorId(req, res, next) {
  try {
    const reserva = await reservasService.buscarReservaPorId(req.params.id, req.usuarioId);
    res.json(reserva);
  } catch (erro) {
    next(erro);
  }
}

export async function listarTodas(_req, res, next) {
  try {
    const reservas = await reservasService.listarTodasReservas();
    res.json(reservas);
  } catch (erro) {
    next(erro);
  }
}

export async function listarMinhas(req, res, next) {
  try {
    const reservas = await reservasService.listarReservasDoUsuario(req.usuarioId);
    res.json(reservas);
  } catch (erro) {
    next(erro);
  }
}

export async function atualizarStatus(req, res, next) {
  try {
    const reserva = await reservasService.atualizarStatusReserva(
      req.usuarioId,
      req.params.id,
      req.body?.status
    );
    res.json(reserva);
  } catch (erro) {
    next(erro);
  }
}

export async function atualizarObservacoesProprietario(req, res, next) {
  try {
    const reserva = await reservasService.atualizarObservacoesProprietario(
      req.usuarioId,
      req.params.id,
      req.body?.observacoes
    );
    res.json(reserva);
  } catch (erro) {
    next(erro);
  }
}
