import { prisma } from "../lib/prisma.js";

// Nesta primeira versão, 1 User (PROPRIETARIO) administra exatamente 1
// Organization — por isso basta buscar pelo ownerId, sem precisar de
// seletor explícito de organização.
export async function buscarOrganizacaoDoProprietario(usuarioId) {
  return prisma.organization.findFirst({ where: { ownerId: usuarioId } });
}
