// Ponto único de integração com um provedor real de SMS (Twilio, Zenvia, AWS SNS...).
// Hoje apenas registra no log do servidor. Quando houver credenciais de um provedor,
// troque o corpo desta função pela chamada real — nenhum outro arquivo precisa mudar.
export async function enviarSms(numero, mensagem) {
  console.log(`[SMS] Para ${numero}: ${mensagem}`);
}
