import { describe, expect, it } from "vitest";
import {
  gerarSlugBase,
  normalizarComodidades,
  normalizarGaleria,
  normalizarInformacoes,
} from "./espacosService.js";

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

describe("normalizarComodidades", () => {
  it("mantém itens válidos, aparando espaços do label", () => {
    expect(normalizarComodidades([{ id: "piscina", label: "  Piscina  " }])).toEqual([
      { id: "piscina", label: "Piscina" },
    ]);
  });

  it("descarta itens sem label ou com label vazio", () => {
    expect(normalizarComodidades([{ label: "" }, { label: "   " }, null, {}])).toEqual([]);
  });

  it("gera id a partir do label quando ausente", () => {
    expect(normalizarComodidades([{ label: "Churrasqueira" }])).toEqual([
      { id: "Churrasqueira", label: "Churrasqueira" },
    ]);
  });

  it("retorna lista vazia quando a entrada não é um array", () => {
    expect(normalizarComodidades(undefined)).toEqual([]);
    expect(normalizarComodidades("não é array")).toEqual([]);
  });
});

describe("normalizarInformacoes", () => {
  it("mantém strings válidas, aparando espaços", () => {
    expect(normalizarInformacoes(["  Permitido som até 22:00  "])).toEqual([
      "Permitido som até 22:00",
    ]);
  });

  it("descarta valores vazios ou que não são string", () => {
    expect(normalizarInformacoes(["", "   ", 123, null, "Texto válido"])).toEqual([
      "Texto válido",
    ]);
  });

  it("retorna lista vazia quando a entrada não é um array", () => {
    expect(normalizarInformacoes(undefined)).toEqual([]);
  });
});

describe("normalizarGaleria", () => {
  it("converte o formato antigo (string = URL de imagem) para o novo formato", () => {
    expect(normalizarGaleria(["https://exemplo.com/foto.jpg"])).toEqual([
      { url: "https://exemplo.com/foto.jpg", tipo: "imagem" },
    ]);
  });

  it("mantém itens já no formato novo, aceitando imagem e vídeo", () => {
    expect(
      normalizarGaleria([
        { url: "https://exemplo.com/foto.jpg", tipo: "imagem" },
        { url: "https://exemplo.com/video.mp4", tipo: "video" },
      ])
    ).toEqual([
      { url: "https://exemplo.com/foto.jpg", tipo: "imagem" },
      { url: "https://exemplo.com/video.mp4", tipo: "video" },
    ]);
  });

  it("trata tipo ausente ou inválido como imagem", () => {
    expect(normalizarGaleria([{ url: "https://exemplo.com/a.jpg" }])).toEqual([
      { url: "https://exemplo.com/a.jpg", tipo: "imagem" },
    ]);
    expect(normalizarGaleria([{ url: "https://exemplo.com/a.jpg", tipo: "gif" }])).toEqual([
      { url: "https://exemplo.com/a.jpg", tipo: "imagem" },
    ]);
  });

  it("descarta itens vazios ou inválidos", () => {
    expect(normalizarGaleria(["", "   ", null, {}, { tipo: "video" }])).toEqual([]);
  });

  it("retorna lista vazia quando a entrada não é um array", () => {
    expect(normalizarGaleria(undefined)).toEqual([]);
  });
});
