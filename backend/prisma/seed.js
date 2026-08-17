import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { espacosMock } from "../../frontend/src/mocks/espacos.js";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("senha-teste", 10);

  await prisma.user.upsert({
    where: { email: "cliente.teste@minhadata.com" },
    update: {},
    create: {
      nome: "Cliente Teste",
      email: "cliente.teste@minhadata.com",
      senhaHash,
    },
  });

  for (const espaco of espacosMock) {
    await prisma.espaco.upsert({
      where: { slug: espaco.slug },
      update: {
        nome: espaco.nome,
        descricao: espaco.descricao,
        tipo: espaco.tipo,
        localizacao: espaco.localizacao,
        preco: espaco.preco,
        unidadePreco: espaco.unidadePreco,
        capacidade: espaco.capacidade,
        avaliacaoNota: espaco.avaliacao?.nota ?? 0,
        avaliacaoTotalAvaliacoes: espaco.avaliacao?.totalAvaliacoes ?? 0,
        imagemCapa: espaco.imagemCapa,
        galeria: espaco.galeria ?? [],
        comodidades: espaco.comodidades ?? [],
        informacoes: espaco.informacoes ?? [],
        disponivel: espaco.disponivel,
      },
      create: {
        nome: espaco.nome,
        slug: espaco.slug,
        descricao: espaco.descricao,
        tipo: espaco.tipo,
        localizacao: espaco.localizacao,
        preco: espaco.preco,
        unidadePreco: espaco.unidadePreco,
        capacidade: espaco.capacidade,
        avaliacaoNota: espaco.avaliacao?.nota ?? 0,
        avaliacaoTotalAvaliacoes: espaco.avaliacao?.totalAvaliacoes ?? 0,
        imagemCapa: espaco.imagemCapa,
        galeria: espaco.galeria ?? [],
        comodidades: espaco.comodidades ?? [],
        informacoes: espaco.informacoes ?? [],
        disponivel: espaco.disponivel,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (erro) => {
    console.error(erro);
    await prisma.$disconnect();
    process.exit(1);
  });
