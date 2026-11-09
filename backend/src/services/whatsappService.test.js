import { describe, expect, it } from "vitest";
import { formatarNumeroWhatsapp } from "./whatsappService.js";

describe("formatarNumeroWhatsapp", () => {
  it("remove formatação e adiciona o código do Brasil", () => {
    expect(formatarNumeroWhatsapp("(81) 99999-0000")).toBe("5581999990000");
  });

  it("não duplica o código do Brasil se já estiver presente", () => {
    expect(formatarNumeroWhatsapp("5581999990000")).toBe("5581999990000");
  });

  it("trata número vazio ou ausente", () => {
    expect(formatarNumeroWhatsapp("")).toBe("55");
    expect(formatarNumeroWhatsapp(undefined)).toBe("55");
  });
});
