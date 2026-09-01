import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";
const LOGIN_PENDENTE_EXPIRES_IN = "5m";

export function gerarTokenAcesso(userId) {
  return jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

export function gerarTokenRefresh(userId) {
  return jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

export function gerarTokenLoginPendente(userId) {
  return jwt.sign({ sub: userId, etapa: "aguardando_2fa" }, ACCESS_SECRET, {
    expiresIn: LOGIN_PENDENTE_EXPIRES_IN,
  });
}

export function verificarTokenAcesso(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verificarTokenRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

export function verificarTokenLoginPendente(token) {
  const payload = jwt.verify(token, ACCESS_SECRET);
  if (payload.etapa !== "aguardando_2fa") {
    throw new Error("Token de login pendente inválido.");
  }
  return payload;
}
