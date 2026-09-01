import { verificarTokenAcesso } from "../lib/jwt.js";
import { AppError } from "./AppError.js";

export function autenticar(req, _res, next) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(new AppError("Não autenticado.", 401));
  }

  try {
    const payload = verificarTokenAcesso(token);
    req.usuarioId = payload.sub;
    next();
  } catch {
    next(new AppError("Sessão expirada ou inválida.", 401));
  }
}
