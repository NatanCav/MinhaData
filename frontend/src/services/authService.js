// src/services/authService.js
// Autenticação real via API — sessão mantida em cookies httpOnly (accessToken/refreshToken).

async function requisitar(caminho, opcoes = {}) {
  const res = await fetch(`/api/auth${caminho}`, {
    method: opcoes.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
  });

  const corpo = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(corpo?.mensagem || "Não foi possível concluir a operação.");
  }

  return corpo;
}

export async function cadastrar({ nome, email, senha, tipoConta }) {
  const { usuario } = await requisitar("/cadastro", {
    method: "POST",
    body: { nome, email, senha, tipoConta },
  });
  return usuario;
}

export async function login({ email, senha }) {
  return requisitar("/login", { method: "POST", body: { email, senha } });
}

export async function confirmarLoginDoisFatores({ loginToken, codigo }) {
  const { usuario } = await requisitar("/login/2fa", {
    method: "POST",
    body: { loginToken, codigo },
  });
  return usuario;
}

export async function logout() {
  await requisitar("/logout", { method: "POST" });
}

export async function recuperarSenha(email) {
  return requisitar("/recuperar-senha", { method: "POST", body: { email } });
}

export async function redefinirSenha({ token, novaSenha }) {
  return requisitar("/redefinir-senha", { method: "POST", body: { token, novaSenha } });
}

export async function obterSessao() {
  try {
    const { usuario } = await requisitar("/me");
    return usuario;
  } catch {
    return null;
  }
}
