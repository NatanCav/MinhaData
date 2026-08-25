// src/services/authService.js
// Autenticação mockada em localStorage — simula o comportamento assíncrono
// e o contrato da futura API REST de autenticação.

import {
  EMAIL_PROPRIETARIO_PADRAO,
  NOME_PROPRIETARIO_PADRAO,
  PROPRIETARIO_ID_PADRAO,
  SENHA_PROPRIETARIO_PADRAO,
} from "../mocks/proprietario";

const CHAVE_USUARIOS = "minhaData:usuarios";
const CHAVE_SESSAO = "minhaData:sessao";

export const PAPEL_CLIENTE = "cliente";
export const PAPEL_PROPRIETARIO = "proprietario";

function lerUsuarios() {
  try {
    const dados = localStorage.getItem(CHAVE_USUARIOS);
    return dados ? JSON.parse(dados) : [];
  } catch {
    return [];
  }
}

function salvarUsuarios(usuarios) {
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}

function paraSessao(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    // Usuários cadastrados antes da introdução do papel (role) não têm o
    // campo salvo no localStorage — tratados como cliente por padrão.
    role: usuario.role || PAPEL_CLIENTE,
  };
}

function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// O back-end ainda não modela múltiplos usuários com papel de proprietário
// (ver schema.prisma) — este mock pré-cadastra a única conta de
// proprietário do produto (ver CLAUDE.md: "único proprietário de espaços
// de lazer"), com id fixo, para permitir testar o painel de gestão via
// login sem precisar de um fluxo de cadastro dedicado a esse papel.
async function garantirProprietarioPadrao() {
  const usuarios = lerUsuarios();
  if (usuarios.some((usuario) => usuario.role === PAPEL_PROPRIETARIO)) return;

  const salt = crypto.randomUUID();
  const senhaHash = await hashSenha(SENHA_PROPRIETARIO_PADRAO, salt);

  salvarUsuarios([
    ...usuarios,
    {
      id: PROPRIETARIO_ID_PADRAO,
      nome: NOME_PROPRIETARIO_PADRAO,
      email: EMAIL_PROPRIETARIO_PADRAO,
      salt,
      senhaHash,
      role: PAPEL_PROPRIETARIO,
      criadoEm: new Date().toISOString(),
    },
  ]);
}

// Hash local (SHA-256 + salt por usuário) só para não gravar a senha em
// texto plano no localStorage deste mock — não é um substituto de um
// hashing de senha real feito no back-end (ex.: bcrypt/argon2).
async function hashSenha(senha, salt) {
  const dados = new TextEncoder().encode(`${salt}:${senha}`);
  const buffer = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function cadastrar({ nome, email, senha }) {
  await aguardar(600);

  const usuarios = lerUsuarios();
  const emailNormalizado = email.trim().toLowerCase();

  if (usuarios.some((usuario) => usuario.email === emailNormalizado)) {
    throw new Error("Este e-mail já está cadastrado.");
  }

  const salt = crypto.randomUUID();
  const senhaHash = await hashSenha(senha, salt);

  const novoUsuario = {
    id: crypto.randomUUID(),
    nome: nome.trim(),
    email: emailNormalizado,
    salt,
    senhaHash,
    // Autocadastro é sempre de cliente — a conta de proprietário é única e
    // pré-provisionada (ver garantirProprietarioPadrao acima).
    role: PAPEL_CLIENTE,
    criadoEm: new Date().toISOString(),
  };

  salvarUsuarios([...usuarios, novoUsuario]);

  const sessao = paraSessao(novoUsuario);
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  return sessao;
}

export async function login({ email, senha }) {
  await aguardar(600);

  const usuarios = lerUsuarios();
  const emailNormalizado = email.trim().toLowerCase();
  const usuario = usuarios.find((item) => item.email === emailNormalizado);

  if (!usuario) {
    throw new Error("E-mail ou senha inválidos.");
  }

  const senhaHash = await hashSenha(senha, usuario.salt);
  if (senhaHash !== usuario.senhaHash) {
    throw new Error("E-mail ou senha inválidos.");
  }

  const sessao = paraSessao(usuario);
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  return sessao;
}

export async function logout() {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem(CHAVE_SESSAO);
      resolve();
    }, 200);
  });
}

export async function recuperarSenha(email) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const usuarios = lerUsuarios();
      const emailNormalizado = email.trim().toLowerCase();
      // Resposta genérica independente do e-mail existir, por segurança.
      usuarios.some((usuario) => usuario.email === emailNormalizado);
      resolve({
        mensagem:
          "Se este e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.",
      });
    }, 600);
  });
}

export function obterSessao() {
  try {
    const dados = localStorage.getItem(CHAVE_SESSAO);
    if (!dados) return null;

    const sessao = JSON.parse(dados);
    // Sessões salvas antes da introdução do papel (role) não têm o campo —
    // tratadas como cliente por padrão, mesma regra de paraSessao.
    return { ...sessao, role: sessao.role || PAPEL_CLIENTE };
  } catch {
    return null;
  }
}

// Pré-provisiona a conta única de proprietário assim que o módulo é
// carregado, para que ela já esteja disponível para login sem exigir um
// passo de setup manual (ver garantirProprietarioPadrao acima).
garantirProprietarioPadrao();

// Quando o back-end estiver disponível, este arquivo vira só isto:
//
// export async function login({ email, senha }) {
//   const res = await fetch("/api/auth/login", {
//     method: "POST",
//     body: JSON.stringify({ email, senha }),
//   });
//   if (!res.ok) throw new Error("E-mail ou senha inválidos.");
//   return res.json();
// }
//
// export async function cadastrar({ nome, email, senha }) {
//   const res = await fetch("/api/auth/cadastro", {
//     method: "POST",
//     body: JSON.stringify({ nome, email, senha }),
//   });
//   if (!res.ok) throw new Error("Não foi possível concluir o cadastro.");
//   return res.json();
// }
//
// export async function logout() {
//   await fetch("/api/auth/logout", { method: "POST" });
// }
//
// export async function recuperarSenha(email) {
//   const res = await fetch("/api/auth/recuperar-senha", {
//     method: "POST",
//     body: JSON.stringify({ email }),
//   });
//   return res.json();
// }
