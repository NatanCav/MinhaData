// src/services/espacosService.js
import { espacosMock } from "../mocks/espacos";

// Simula o comportamento assíncrono de uma chamada real de API
// (delay proposital para já testarmos loading states)
export async function getEspacos() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(espacosMock);
    }, 600);
  });
}

// Quando o Pedro entregar a API, este arquivo vira só isto:
//
// export async function getEspacos() {
//   const res = await fetch("/api/espacos");
//   if (!res.ok) throw new Error("Erro ao buscar espaços");
//   return res.json();
// }