import crypto from "node:crypto";

export function gerarCodigoNumerico(tamanho = 6) {
  const max = 10 ** tamanho;
  const numero = crypto.randomInt(0, max);
  return String(numero).padStart(tamanho, "0");
}

export function gerarCodigosBackup(quantidade = 8) {
  return Array.from({ length: quantidade }, () => crypto.randomBytes(5).toString("hex"));
}
