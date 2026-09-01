// Ponto único de integração com um provedor real de e-mail (SMTP, SendGrid, SES...).
// Hoje apenas registra no log do servidor — trocar o corpo desta função quando
// houver credenciais de um provedor configuradas.
export async function enviarEmail(destinatario, assunto, mensagem) {
  console.log(`[EMAIL] Para ${destinatario} | ${assunto}\n${mensagem}`);
}
