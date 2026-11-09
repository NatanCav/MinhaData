// Ponto único de integração com um provedor real de e-mail — hoje Resend
// (https://resend.com). Sem RESEND_API_KEY configurada (ex.: em dev local),
// continua apenas registrando no log do servidor, como antes.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_REMETENTE = process.env.EMAIL_REMETENTE || "MinhaData <onboarding@resend.dev>";

export async function enviarEmail(destinatario, assunto, mensagem) {
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL] Para ${destinatario} | ${assunto}\n${mensagem}`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_REMETENTE,
        to: destinatario,
        subject: assunto,
        text: mensagem,
      }),
    });

    if (!res.ok) {
      const corpo = await res.text().catch(() => "");
      console.error(`[EMAIL] Falha ao enviar para ${destinatario}: ${res.status} ${corpo}`);
    }
  } catch (erro) {
    console.error(`[EMAIL] Erro ao enviar para ${destinatario}:`, erro);
  }
}
