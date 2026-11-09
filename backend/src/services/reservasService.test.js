import { describe, expect, it } from "vitest";
import { avaliarTransicaoStatus, horariosSeSobrepoe } from "./reservasService.js";

describe("horariosSeSobrepoe", () => {
  it("detecta sobreposição parcial", () => {
    expect(horariosSeSobrepoe("10:00", "18:00", "14:00", "16:00")).toBe(true);
    expect(horariosSeSobrepoe("10:00", "12:00", "11:00", "20:00")).toBe(true);
  });

  it("não acusa conflito quando os horários só se encostam", () => {
    expect(horariosSeSobrepoe("10:00", "12:00", "12:00", "14:00")).toBe(false);
    expect(horariosSeSobrepoe("12:00", "14:00", "10:00", "12:00")).toBe(false);
  });

  it("não acusa conflito quando os horários são totalmente distintos", () => {
    expect(horariosSeSobrepoe("08:00", "09:00", "10:00", "11:00")).toBe(false);
  });
});

describe("avaliarTransicaoStatus", () => {
  it("rejeita status que não existe", () => {
    const resultado = avaliarTransicaoStatus({
      proprietario: true,
      donoDaReserva: false,
      novoStatus: "aprovada",
      statusAtual: "pendente",
    });
    expect(resultado).toEqual({ permitido: false, motivo: "status_invalido" });
  });

  it("rejeita quem não é proprietário nem dono da reserva", () => {
    const resultado = avaliarTransicaoStatus({
      proprietario: false,
      donoDaReserva: false,
      novoStatus: "cancelada",
      statusAtual: "pendente",
    });
    expect(resultado).toEqual({ permitido: false, motivo: "sem_acesso" });
  });

  it("permite proprietário aprovar reserva pendente", () => {
    const resultado = avaliarTransicaoStatus({
      proprietario: true,
      donoDaReserva: false,
      novoStatus: "confirmada",
      statusAtual: "pendente",
    });
    expect(resultado).toEqual({ permitido: true });
  });

  it("rejeita proprietário aprovar reserva já confirmada", () => {
    const resultado = avaliarTransicaoStatus({
      proprietario: true,
      donoDaReserva: false,
      novoStatus: "confirmada",
      statusAtual: "confirmada",
    });
    expect(resultado).toEqual({ permitido: false, motivo: "transicao_invalida" });
  });

  it("rejeita cliente tentando aprovar a própria reserva", () => {
    const resultado = avaliarTransicaoStatus({
      proprietario: false,
      donoDaReserva: true,
      novoStatus: "confirmada",
      statusAtual: "pendente",
    });
    expect(resultado).toEqual({ permitido: false, motivo: "sem_permissao" });
  });

  it("permite cliente cancelar a própria reserva pendente ou confirmada", () => {
    expect(
      avaliarTransicaoStatus({
        proprietario: false,
        donoDaReserva: true,
        novoStatus: "cancelada",
        statusAtual: "pendente",
      })
    ).toEqual({ permitido: true });

    expect(
      avaliarTransicaoStatus({
        proprietario: false,
        donoDaReserva: true,
        novoStatus: "cancelada",
        statusAtual: "confirmada",
      })
    ).toEqual({ permitido: true });
  });

  it("rejeita cancelar reserva já cancelada ou recusada", () => {
    expect(
      avaliarTransicaoStatus({
        proprietario: true,
        donoDaReserva: false,
        novoStatus: "cancelada",
        statusAtual: "cancelada",
      })
    ).toEqual({ permitido: false, motivo: "transicao_invalida" });

    expect(
      avaliarTransicaoStatus({
        proprietario: true,
        donoDaReserva: false,
        novoStatus: "cancelada",
        statusAtual: "recusada",
      })
    ).toEqual({ permitido: false, motivo: "transicao_invalida" });
  });
});
