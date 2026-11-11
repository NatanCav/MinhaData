import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/AppError.js";
import {
  gerarTokenAcesso,
  gerarTokenRefresh,
  gerarTokenLoginPendente,
  verificarTokenRefresh,
  verificarTokenLoginPendente,
} from "../lib/jwt.js";
import { validarCodigoOuBackup } from "../lib/doisFatores.js";
import { enviarEmail } from "./emailService.js";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TAMANHO_MINIMO_SENHA = 8;
const REGEX_SENHA_FORTE = /^(?=.*[A-Za-z])(?=.*\d).+$/;
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_SENHA_EXPIRES_MS = 60 * 60 * 1000;

function paraApi(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    cpf: usuario.cpf,
    telefone: usuario.telefone,
    telefoneVerificado: usuario.telefoneVerificado,
    tipoConta: usuario.tipoConta,
    role: usuario.role === "PROPRIETARIO" ? "proprietario" : "cliente",
    doisFatoresAtivo: usuario.doisFatoresAtivo,
    precisaConfigurarDoisFatores: usuario.tipoConta === "PJ" && !usuario.doisFatoresAtivo,
  };
}

function validarSenha(senha) {
  if (!senha || senha.length < TAMANHO_MINIMO_SENHA || !REGEX_SENHA_FORTE.test(senha)) {
    throw new AppError(
      `A senha deve ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres, incluindo letras e números.`
    );
  }
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function emitirSessao(usuario) {
  const accessToken = gerarTokenAcesso(usuario.id);
  const refreshToken = gerarTokenRefresh(usuario.id);

  await prisma.refreshToken.create({
    data: {
      userId: usuario.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
    },
  });

  return { accessToken, refreshToken, usuario: paraApi(usuario) };
}

export async function cadastrar({ nome, email, senha, tipoConta }) {
  if (!nome || !nome.trim()) {
    throw new AppError("Informe seu nome.");
  }

  const emailNormalizado = String(email ?? "").trim().toLowerCase();
  if (!emailNormalizado || !REGEX_EMAIL.test(emailNormalizado)) {
    throw new AppError("Informe um e-mail válido.");
  }

  validarSenha(senha);

  const tipoContaNormalizado = tipoConta === "PJ" ? "PJ" : "PF";

  const existente = await prisma.user.findUnique({ where: { email: emailNormalizado } });
  if (existente) {
    throw new AppError("Este e-mail já está cadastrado.");
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const usuario = await prisma.user.create({
    data: {
      nome: nome.trim(),
      email: emailNormalizado,
      senhaHash,
      tipoConta: tipoContaNormalizado,
    },
  });

  return emitirSessao(usuario);
}

export async function login({ email, senha }) {
  const emailNormalizado = String(email ?? "").trim().toLowerCase();
  const usuario = await prisma.user.findUnique({ where: { email: emailNormalizado } });

  if (!usuario || !(await bcrypt.compare(senha ?? "", usuario.senhaHash))) {
    throw new AppError("E-mail ou senha inválidos.", 401);
  }

  if (usuario.doisFatoresAtivo) {
    return { requerDoisFatores: true, loginToken: gerarTokenLoginPendente(usuario.id) };
  }

  return { requerDoisFatores: false, ...(await emitirSessao(usuario)) };
}

export async function confirmarLoginDoisFatores({ loginToken, codigo }) {
  let payload;
  try {
    payload = verificarTokenLoginPendente(loginToken);
  } catch {
    throw new AppError("Sessão de login expirada. Faça login novamente.", 401);
  }

  const usuario = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!usuario || !usuario.doisFatoresAtivo) {
    throw new AppError("Sessão de login inválida.", 401);
  }

  const resultado = await validarCodigoOuBackup(usuario, codigo);
  if (!resultado.valido) {
    throw new AppError("Código de verificação inválido.", 401);
  }

  if (resultado.codigosBackupAtualizados) {
    await prisma.user.update({
      where: { id: usuario.id },
      data: { doisFatoresCodigosBackup: resultado.codigosBackupAtualizados },
    });
  }

  return emitirSessao(usuario);
}

export async function renovarSessao(refreshTokenBruto) {
  if (!refreshTokenBruto) {
    throw new AppError("Sessão não encontrada.", 401);
  }

  let payload;
  try {
    payload = verificarTokenRefresh(refreshTokenBruto);
  } catch {
    throw new AppError("Sessão expirada. Faça login novamente.", 401);
  }

  const tokenHash = hashToken(refreshTokenBruto);
  const registro = await prisma.refreshToken.findFirst({
    where: { userId: payload.sub, tokenHash, revokedAt: null },
  });

  if (!registro || registro.expiresAt < new Date()) {
    throw new AppError("Sessão expirada. Faça login novamente.", 401);
  }

  const usuario = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!usuario) {
    throw new AppError("Sessão inválida.", 401);
  }

  await prisma.refreshToken.update({
    where: { id: registro.id },
    data: { revokedAt: new Date() },
  });

  return emitirSessao(usuario);
}

export async function logout(refreshTokenBruto) {
  if (!refreshTokenBruto) return;

  const tokenHash = hashToken(refreshTokenBruto);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function solicitarRecuperacaoSenha(email) {
  const emailNormalizado = String(email ?? "").trim().toLowerCase();
  const usuario = await prisma.user.findUnique({ where: { email: emailNormalizado } });

  if (usuario) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: usuario.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_SENHA_EXPIRES_MS),
      },
    });

    await enviarEmail(
      usuario.email,
      "Redefinição de senha - MinhaData",
      `Use este código para redefinir sua senha (válido por 1 hora): ${token}`
    );
  }

  return {
    mensagem: "Se este e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.",
  };
}

export async function redefinirSenha({ token, novaSenha }) {
  if (!token) {
    throw new AppError("Token de redefinição inválido.");
  }
  validarSenha(novaSenha);

  const tokenHash = hashToken(token);
  const registro = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, usedAt: null },
  });

  if (!registro || registro.expiresAt < new Date()) {
    throw new AppError("Token de redefinição inválido ou expirado.", 401);
  }

  const senhaHash = await bcrypt.hash(novaSenha, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: registro.userId }, data: { senhaHash } }),
    prisma.passwordResetToken.update({ where: { id: registro.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.updateMany({
      where: { userId: registro.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  return { mensagem: "Senha redefinida com sucesso." };
}

export async function obterUsuarioPorId(id) {
  const usuario = await prisma.user.findUnique({ where: { id } });
  if (!usuario) {
    throw new AppError("Usuário não encontrado.", 404);
  }
  return paraApi(usuario);
}
