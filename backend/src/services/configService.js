import { prisma } from "../lib/prisma.js";

export async function obterWhatsappContato() {
  const proprietario = await prisma.user.findFirst({
    where: { role: "PROPRIETARIO" },
    select: { whatsappContato: true },
  });

  return { whatsapp: proprietario?.whatsappContato || null };
}
