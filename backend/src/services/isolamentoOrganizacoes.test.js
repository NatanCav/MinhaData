import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../lib/prisma.js";
import { atualizarEspaco, criarEspaco, excluirEspaco } from "./espacosService.js";
import {
  atualizarObservacoesProprietario,
  atualizarStatusReserva,
  buscarReservaPorId,
  criarReservaManual,
  listarTodasReservas,
} from "./reservasService.js";

// Testes de integração contra o banco real da branch dev-multi-tenant (ver
// PLANO_SAAS.md, Etapa 2) — criam e removem seus próprios dados, prefixados
// com "Teste Isolamento", para nunca tocar em dados reais da branch.
const PREFIXO_SLUG = "teste-isolamento";
const PREFIXO_NOME = "Teste Isolamento";

let orgA;
let orgB;
let userA;
let espacoA;
let espacoB;
let reservaA;
let reservaB;

function dadosEspacoValidos(nome) {
  return {
    nome,
    tipo: "quadra",
    localizacao: "Local de teste",
    descricao: "Espaço criado para teste automatizado de isolamento.",
    preco: 100,
    unidadePreco: "dia",
    capacidade: 10,
  };
}

beforeAll(async () => {
  userA = await prisma.user.create({
    data: {
      nome: `${PREFIXO_NOME} Owner A`,
      email: `${PREFIXO_SLUG}.owner.a@example.com`,
      senhaHash: "hash-fake-para-teste",
      role: "PROPRIETARIO",
    },
  });
  const userB = await prisma.user.create({
    data: {
      nome: `${PREFIXO_NOME} Owner B`,
      email: `${PREFIXO_SLUG}.owner.b@example.com`,
      senhaHash: "hash-fake-para-teste",
      role: "PROPRIETARIO",
    },
  });

  orgA = await prisma.organization.create({
    data: { nome: `${PREFIXO_NOME} Org A`, ownerId: userA.id },
  });
  orgB = await prisma.organization.create({
    data: { nome: `${PREFIXO_NOME} Org B`, ownerId: userB.id },
  });

  espacoA = await prisma.espaco.create({
    data: { ...dadosEspacoValidos(`${PREFIXO_NOME} Espaco A`), slug: `${PREFIXO_SLUG}-espaco-a`, organizationId: orgA.id },
  });
  espacoB = await prisma.espaco.create({
    data: { ...dadosEspacoValidos(`${PREFIXO_NOME} Espaco B`), slug: `${PREFIXO_SLUG}-espaco-b`, organizationId: orgB.id },
  });

  reservaA = await prisma.reserva.create({
    data: {
      data: "2099-01-01",
      horarioInicio: "10:00",
      horarioFim: "12:00",
      status: "pendente",
      espacoId: espacoA.id,
      nomeCliente: `${PREFIXO_NOME} Cliente A`,
      telefoneCliente: "11999990000",
    },
  });
  reservaB = await prisma.reserva.create({
    data: {
      data: "2099-01-01",
      horarioInicio: "10:00",
      horarioFim: "12:00",
      status: "pendente",
      espacoId: espacoB.id,
      nomeCliente: `${PREFIXO_NOME} Cliente B`,
      telefoneCliente: "11999990001",
    },
  });
});

afterAll(async () => {
  await prisma.reserva.deleteMany({ where: { nomeCliente: { startsWith: PREFIXO_NOME } } });
  await prisma.espaco.deleteMany({ where: { slug: { startsWith: PREFIXO_SLUG } } });
  await prisma.organization.deleteMany({ where: { nome: { startsWith: PREFIXO_NOME } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: PREFIXO_SLUG } } });
});

describe("isolamento entre organizações", () => {
  it("listarTodasReservas só retorna reservas da própria organização", async () => {
    const reservas = await listarTodasReservas(userA.id);
    const ids = reservas.map((reserva) => reserva.id);
    expect(ids).toContain(reservaA.id);
    expect(ids).not.toContain(reservaB.id);
  });

  it("buscarReservaPorId bloqueia proprietário de outra organização", async () => {
    await expect(buscarReservaPorId(reservaA.id, userA.id)).resolves.toMatchObject({
      id: reservaA.id,
    });
    await expect(buscarReservaPorId(reservaB.id, userA.id)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("atualizarStatusReserva bloqueia alterar reserva de outra organização", async () => {
    await expect(
      atualizarStatusReserva(userA.id, reservaA.id, "confirmada")
    ).resolves.toMatchObject({ status: "confirmada" });
    await expect(atualizarStatusReserva(userA.id, reservaB.id, "confirmada")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("atualizarObservacoesProprietario bloqueia reserva de outra organização", async () => {
    await expect(
      atualizarObservacoesProprietario(userA.id, reservaA.id, "nota da organização A")
    ).resolves.toMatchObject({ id: reservaA.id });
    await expect(
      atualizarObservacoesProprietario(userA.id, reservaB.id, "tentativa indevida")
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("criarReservaManual bloqueia cadastro em espaço de outra organização", async () => {
    await expect(
      criarReservaManual(userA.id, {
        espacoSlug: espacoB.slug,
        datas: ["2099-02-01"],
        horarioInicio: "08:00",
        horarioFim: "09:00",
        nomeCliente: `${PREFIXO_NOME} Cliente Manual`,
        telefoneCliente: "11999990002",
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("criarReservaManual permite cadastro no próprio espaço", async () => {
    const reservas = await criarReservaManual(userA.id, {
      espacoSlug: espacoA.slug,
      datas: ["2099-02-02"],
      horarioInicio: "08:00",
      horarioFim: "09:00",
      nomeCliente: `${PREFIXO_NOME} Cliente Manual`,
      telefoneCliente: "11999990002",
    });
    expect(reservas).toHaveLength(1);
    expect(reservas[0].espaco.slug).toBe(espacoA.slug);
  });

  it("atualizarEspaco bloqueia editar espaço de outra organização", async () => {
    await expect(
      atualizarEspaco(espacoB.slug, dadosEspacoValidos(`${PREFIXO_NOME} Espaco B`), orgA.id)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("atualizarEspaco permite editar o próprio espaço", async () => {
    const atualizado = await atualizarEspaco(
      espacoA.slug,
      dadosEspacoValidos(`${PREFIXO_NOME} Espaco A editado`),
      orgA.id
    );
    expect(atualizado.slug).toBe(espacoA.slug);
    expect(atualizado.nome).toBe(`${PREFIXO_NOME} Espaco A editado`);
  });

  it("excluirEspaco bloqueia excluir espaço de outra organização", async () => {
    await expect(excluirEspaco(espacoB.slug, orgA.id)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("criarEspaco vincula o novo espaço à organização do proprietário", async () => {
    const espaco = await criarEspaco(dadosEspacoValidos(`${PREFIXO_NOME} Espaco Novo`), orgA.id);
    const entidade = await prisma.espaco.findUnique({ where: { slug: espaco.slug } });
    expect(entidade.organizationId).toBe(orgA.id);
  });
});
