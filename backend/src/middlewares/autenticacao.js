import { verificarTokenAcesso } from "../lib/jwt.js";
import { AppError } from "./AppError.js";
import { prisma } from "../lib/prisma.js";

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

export async function exigirProprietario(req, _res, next) {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.usuarioId },
      select: { role: true },
    });

    if (!usuario || usuario.role !== "PROPRIETARIO") {
      return next(new AppError("Apenas o proprietário pode realizar esta ação.", 403));
    }

    next();
  } catch (erro) {
    next(erro);
  }
}
