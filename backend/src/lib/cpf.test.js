import { describe, expect, it } from "vitest";
import { cpfValido, normalizarCpf } from "./cpf.js";

describe("normalizarCpf", () => {
  it("remove pontuação e mantém só os dígitos", () => {
    expect(normalizarCpf("529.982.247-25")).toBe("52998224725");
  });

  it("trata valor ausente como string vazia", () => {
    expect(normalizarCpf(undefined)).toBe("");
    expect(normalizarCpf(null)).toBe("");
  });
});

describe("cpfValido", () => {
  it("aceita um CPF válido, formatado ou não", () => {
    expect(cpfValido("529.982.247-25")).toBe(true);
    expect(cpfValido("52998224725")).toBe(true);
  });

  it("rejeita CPF com dígito verificador incorreto", () => {
    expect(cpfValido("529.982.247-26")).toBe(false);
  });

  it("rejeita CPF com todos os dígitos iguais", () => {
    expect(cpfValido("111.111.111-11")).toBe(false);
  });

  it("rejeita CPF com tamanho incorreto", () => {
    expect(cpfValido("123456")).toBe(false);
    expect(cpfValido("")).toBe(false);
  });
});
