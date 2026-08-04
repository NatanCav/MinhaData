// src/services/espacosService.js
import { buscarEspacoPorSlug, espacosMock } from "../mocks/espacos";

// Simula o comportamento assíncrono de uma chamada real de API
// (delay proposital para já testarmos loading states)
export async function getEspacos() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(espacosMock);
    }, 600);
  });
}

export async function getEspacoPorSlug(slug) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const espaco = buscarEspacoPorSlug(slug);
      if (espaco) {
        resolve(espaco);
      } else {
        reject(new Error("Espaço não encontrado"));
      }
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
//
// export async function getEspacoPorSlug(slug) {
//   const res = await fetch(`/api/espacos/${slug}`);
//   if (!res.ok) throw new Error("Espaço não encontrado");
//   return res.json();
// }