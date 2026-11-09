import { describe, expect, it } from "vitest";
import { gerarSlugBase } from "./espacosService.js";

describe("gerarSlugBase", () => {
  it("converte nome para minúsculas separadas por hífen", () => {
    expect(gerarSlugBase("Chácara Paraíso")).toBe("chacara-paraiso");
  });

  it("remove acentos e caracteres especiais", () => {
    expect(gerarSlugBase("Espaço de Lazer com Piscina & Churrasqueira!")).toBe(
      "espaco-de-lazer-com-piscina-churrasqueira"
    );
  });

  it("remove espaços extras e hífens nas pontas", () => {
    expect(gerarSlugBase("  Quadra Poliesportiva  ")).toBe("quadra-poliesportiva");
  });

  it("colapsa múltiplos separadores em um único hífen", () => {
    expect(gerarSlugBase("Salão   de --- Festas")).toBe("salao-de-festas");
  });
});
