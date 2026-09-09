// src/mocks/proprietario.js
//
// O produto tem um único proprietário de espaços (ver CLAUDE.md). Como o
// back-end ainda não modela usuários com papel (role) nem a relação
// espaço → proprietário, esta conta é pré-provisionada no mock de
// autenticação (ver authService.js) com um id fixo, para que os demais
// mocks (espaços e reservas do painel de gestão) possam referenciar o
// mesmo dono de forma consistente.

export const PROPRIETARIO_ID_PADRAO = "proprietario-1";
export const NOME_PROPRIETARIO_PADRAO = "Proprietário MinhaData";
export const EMAIL_PROPRIETARIO_PADRAO = "proprietario@minhadata.com";
export const SENHA_PROPRIETARIO_PADRAO = "proprietario123";
