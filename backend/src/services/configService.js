import { prisma } from "../lib/prisma.js";

export async function obterContatosWhatsapp() {
  const proprietario = await prisma.user.findFirst({
    where: { role: "PROPRIETARIO" },
    select: { contatosWhatsapp: true },
  });

  return { contatos: Array.isArray(proprietario?.contatosWhatsapp) ? proprietario.contatosWhatsapp : [] };
}
