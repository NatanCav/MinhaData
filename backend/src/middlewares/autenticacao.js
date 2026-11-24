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

// Preenche req.usuarioId quando há uma sessão válida, mas nunca bloqueia a
// requisição — usado em rotas que funcionam tanto para visitantes quanto
// para usuários logados (ex.: criar reserva sem precisar de conta).
export function autenticarOpcional(req, _res, next) {
  const token = req.cookies?.accessToken;

  if (!token) {
    req.usuarioId = null;
    return next();
  }

  try {
    const payload = verificarTokenAcesso(token);
    req.usuarioId = payload.sub;
  } catch {
    req.usuarioId = null;
  }

  next();
}

// Além de exigir o papel de proprietário, carrega req.organizacaoId — toda
// rota administrativa usa esse id pra filtrar os dados da própria
// organização, nunca do sistema inteiro.
export async function exigirProprietario(req, _res, next) {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.usuarioId },
      select: { role: true, organizacoes: { select: { id: true }, take: 1 } },
    });

    if (!usuario || usuario.role !== "PROPRIETARIO") {
      return next(new AppError("Apenas o proprietário pode realizar esta ação.", 403));
    }

    const organizacao = usuario.organizacoes[0];
    if (!organizacao) {
      return next(new AppError("Nenhuma organização associada a este usuário.", 403));
    }

    req.organizacaoId = organizacao.id;
    next();
  } catch (erro) {
    next(erro);
  }
}
