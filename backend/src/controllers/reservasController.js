import * as reservasService from "../services/reservasService.js";

export async function criar(req, res, next) {
  try {
    const reserva = await reservasService.criarReserva(req.body ?? {});
    res.status(201).json(reserva);
  } catch (erro) {
    next(erro);
  }
}

export async function obterPorId(req, res, next) {
  try {
    const reserva = await reservasService.buscarReservaPorId(req.params.id);
    res.json(reserva);
  } catch (erro) {
    next(erro);
  }
}
