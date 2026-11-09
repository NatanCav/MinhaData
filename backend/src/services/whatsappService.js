// Envia mensagens via WhatsApp Business Cloud API (Meta). Sem as
// credenciais configuradas (ex.: dev local), continua apenas registrando
// no log do servidor.
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || "status_reserva";

// A API exige o número em formato internacional, só dígitos (ex.:
// 5581999990000). O telefone do cliente é digitado livremente no
// formulário de reserva, então normaliza aqui antes de enviar.
export function formatarNumeroWhatsapp(telefone) {
  const digitos = String(telefone ?? "").replace(/\D/g, "");
  if (digitos.startsWith("55") && digitos.length >= 12) {
    return digitos;
  }
  return `55${digitos}`;
}

export async function enviarWhatsapp(numero, parametros) {
  const numeroFormatado = formatarNumeroWhatsapp(numero);

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.log(
      `[WHATSAPP] Para ${numeroFormatado} | template=${WHATSAPP_TEMPLATE_NAME} | ${JSON.stringify(parametros)}`
    );
    return;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: numeroFormatado,
          type: "template",
          template: {
            name: WHATSAPP_TEMPLATE_NAME,
            language: { code: "pt_BR" },
            components: [
              {
                type: "body",
                parameters: parametros.map((texto) => ({ type: "text", text: texto })),
              },
            ],
          },
        }),
      }
    );

    if (!res.ok) {
      const corpo = await res.text().catch(() => "");
      console.error(`[WHATSAPP] Falha ao enviar para ${numeroFormatado}: ${res.status} ${corpo}`);
    }
  } catch (erro) {
    console.error(`[WHATSAPP] Erro ao enviar para ${numeroFormatado}:`, erro);
  }
}
