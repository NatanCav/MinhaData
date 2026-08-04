// src/services/disponibilidadeService.js
import { buscarDisponibilidadePorSlug } from "../mocks/disponibilidade";

// Simula o comportamento assíncrono de uma chamada real de API
// (delay proposital para já testarmos loading states)
export async function getDisponibilidade(slug) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(buscarDisponibilidadePorSlug(slug));
    }, 400);
  });
}

// Quando o Pedro entregar a API, este arquivo vira só isto:
//
// export async function getDisponibilidade(slug) {
//   const res = await fetch(`/api/espacos/${slug}/disponibilidade`);
//   if (!res.ok) throw new Error("Erro ao buscar disponibilidade");
//   return res.json();
// }
