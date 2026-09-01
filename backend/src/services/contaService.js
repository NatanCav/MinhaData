import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middlewares/AppError.js";
import {
  gerarSegredo,
  gerarOtpAuthUrl,
  codigoTotpValido,
  validarCodigoOuBackup,
} from "../lib/doisFatores.js";
import { gerarCodigoNumerico, gerarCodigosBackup } from "../lib/codigo.js";
import { enviarSms } from "./smsService.js";

const TAMANHO_MINIMO_SENHA = 8;
const REGEX_SENHA_FORTE = /^(?=.*[A-Za-z])(?=.*\d).+$/;
const REGEX_TELEFONE = /^\d{10,13}$/;
const CODIGO_TELEFONE_EXPIRES_MS = 10 * 60 * 1000;
const CODIGO_TELEFONE_MAX_TENTATIVAS = 5;

async function buscarUsuario(userId) {
  const usuario = await prisma.user.findUnique({ where: { id: userId } });
  if (!usuario) {
    throw new AppError("Usuário não encontrado.", 404);
  }
  return usuario;
}

export async function alterarSenha(userId, { senhaAtual, novaSenha }) {
  const usuario = await buscarUsuario(userId);

  if (!(await bcrypt.compare(senhaAtual ?? "", usuario.senhaHash))) {
    throw new AppError("Senha atual incorreta.", 401);
  }

  if (!novaSenha || novaSenha.length < TAMANHO_MINIMO_SENHA || !REGEX_SENHA_FORTE.test(novaSenha)) {
    throw new AppError(
      `A nova senha deve ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres, incluindo letras e números.`
    );
  }

  const senhaHash = await bcrypt.hash(novaSenha, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { senhaHash } }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  return { mensagem: "Senha alterada com sucesso." };
}

export async function iniciarDoisFatores(userId) {
  const usuario = await buscarUsuario(userId);
  if (usuario.doisFatoresAtivo) {
    throw new AppError("A autenticação de dois fatores já está ativa.");
  }

  const secret = gerarSegredo();
  await prisma.user.update({
    where: { id: userId },
    data: { doisFatoresSecretPendente: secret },
  });

  const otpAuthUrl = gerarOtpAuthUrl(usuario.email, secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

  return { secret, otpAuthUrl, qrCodeDataUrl };
}

export async function confirmarDoisFatores(userId, codigo) {
  const usuario = await buscarUsuario(userId);
  if (!usuario.doisFatoresSecretPendente) {
    throw new AppError("Nenhuma configuração de dois fatores em andamento. Inicie novamente.");
  }

  if (!codigoTotpValido(usuario.doisFatoresSecretPendente, codigo)) {
    throw new AppError("Código de verificação inválido.");
  }

  const codigosBackup = gerarCodigosBackup();
  const codigosBackupHash = await Promise.all(codigosBackup.map((c) => bcrypt.hash(c, 10)));

  await prisma.user.update({
    where: { id: userId },
    data: {
      doisFatoresAtivo: true,
      doisFatoresSecret: usuario.doisFatoresSecretPendente,
      doisFatoresSecretPendente: null,
      doisFatoresCodigosBackup: codigosBackupHash,
    },
  });

  return {
    mensagem: "Autenticação de dois fatores ativada com sucesso.",
    codigosBackup,
  };
}

export async function desativarDoisFatores(userId, { senha, codigo }) {
  const usuario = await buscarUsuario(userId);

  if (usuario.tipoConta === "PJ") {
    throw new AppError(
      "Contas pessoa jurídica exigem autenticação de dois fatores ativa e não podem desativá-la."
    );
  }

  if (!usuario.doisFatoresAtivo) {
    throw new AppError("A autenticação de dois fatores não está ativa.");
  }

  if (!(await bcrypt.compare(senha ?? "", usuario.senhaHash))) {
    throw new AppError("Senha incorreta.", 401);
  }

  const resultado = await validarCodigoOuBackup(usuario, codigo);
  if (!resultado.valido) {
    throw new AppError("Código de verificação inválido.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      doisFatoresAtivo: false,
      doisFatoresSecret: null,
      doisFatoresCodigosBackup: [],
    },
  });

  return { mensagem: "Autenticação de dois fatores desativada." };
}

export async function solicitarVerificacaoTelefone(userId, telefone) {
  const telefoneNormalizado = String(telefone ?? "").replace(/\D/g, "");
  if (!REGEX_TELEFONE.test(telefoneNormalizado)) {
    throw new AppError("Informe um número de celular válido, com DDD.");
  }

  const codigo = gerarCodigoNumerico(6);
  const codigoHash = await bcrypt.hash(codigo, 10);

  await prisma.$transaction([
    prisma.verificacaoTelefone.deleteMany({ where: { userId } }),
    prisma.verificacaoTelefone.create({
      data: {
        userId,
        telefone: telefoneNormalizado,
        codigoHash,
        expiresAt: new Date(Date.now() + CODIGO_TELEFONE_EXPIRES_MS),
      },
    }),
  ]);

  await enviarSms(
    telefoneNormalizado,
    `Seu código de verificação MinhaData é ${codigo}. Válido por 10 minutos.`
  );

  return { mensagem: "Enviamos um código de verificação por SMS para o número informado." };
}

export async function confirmarVerificacaoTelefone(userId, codigo) {
  const verificacao = await prisma.verificacaoTelefone.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!verificacao || verificacao.expiresAt < new Date()) {
    throw new AppError("Código expirado. Solicite um novo.");
  }

  if (verificacao.tentativas >= CODIGO_TELEFONE_MAX_TENTATIVAS) {
    throw new AppError("Número de tentativas excedido. Solicite um novo código.");
  }

  const valido = await bcrypt.compare(String(codigo ?? "").trim(), verificacao.codigoHash);

  if (!valido) {
    await prisma.verificacaoTelefone.update({
      where: { id: verificacao.id },
      data: { tentativas: { increment: 1 } },
    });
    throw new AppError("Código de verificação inválido.");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { telefone: verificacao.telefone, telefoneVerificado: true },
    }),
    prisma.verificacaoTelefone.deleteMany({ where: { userId } }),
  ]);

  return { mensagem: "Número de celular confirmado com sucesso." };
}
