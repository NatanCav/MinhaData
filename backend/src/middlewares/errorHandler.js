import { AppError } from "./AppError.js";

export function errorHandler(erro, _req, res, _next) {
  if (erro instanceof AppError) {
    return res.status(erro.statusCode).json({ mensagem: erro.message });
  }

  console.error(erro);
  return res.status(500).json({ mensagem: "Erro interno do servidor." });
}

export function rotaNaoEncontrada(_req, res) {
  res.status(404).json({ mensagem: "Rota não encontrada." });
}
