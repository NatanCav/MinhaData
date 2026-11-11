// src/services/contaService.js
// Configurações da conta autenticada: senha, autenticação de dois fatores e celular.

async function requisitar(caminho, opcoes = {}) {
  const res = await fetch(`/api/conta${caminho}`, {
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

export async function alterarSenha({ senhaAtual, novaSenha }) {
  return requisitar("/senha", { method: "PATCH", body: { senhaAtual, novaSenha } });
}

export async function iniciarDoisFatores() {
  return requisitar("/2fa/iniciar", { method: "POST" });
}

export async function confirmarDoisFatores(codigo) {
  return requisitar("/2fa/confirmar", { method: "POST", body: { codigo } });
}

export async function desativarDoisFatores({ senha, codigo }) {
  return requisitar("/2fa/desativar", { method: "POST", body: { senha, codigo } });
}

export async function solicitarVerificacaoTelefone(telefone) {
  return requisitar("/telefone/solicitar-verificacao", { method: "POST", body: { telefone } });
}

export async function confirmarVerificacaoTelefone(codigo) {
  return requisitar("/telefone/confirmar", { method: "POST", body: { codigo } });
}

export async function atualizarContatosWhatsapp(contatos) {
  return requisitar("/whatsapp", { method: "PATCH", body: { contatos } });
}
