// src/mocks/disponibilidade.js
//
// Dados falsos que simulam a agenda de cada espaço: datas já
// reservadas por completo e, para espaços com unidadePreco "hora",
// os horários já reservados em cada data específica.

export const disponibilidadeMock = {
  "chacara-paraiso": {
    datasIndisponiveis: ["2026-08-15", "2026-08-16", "2026-08-22", "2026-08-29"],
    horariosIndisponiveisPorData: {},
  },
  "salao-de-festas": {
    datasIndisponiveis: ["2026-08-08", "2026-08-09", "2026-08-30"],
    horariosIndisponiveisPorData: {},
  },
  "quiosque-premium": {
    datasIndisponiveis: ["2026-08-10", "2026-08-23"],
    horariosIndisponiveisPorData: {},
  },
  "quadra-poliesportiva": {
    datasIndisponiveis: [],
    horariosIndisponiveisPorData: {
      "2026-08-05": ["08:00", "10:00", "18:00"],
      "2026-08-06": ["14:00", "16:00"],
      "2026-08-12": ["08:00", "20:00"],
    },
  },
};

// Helper útil para o CardReserva: busca a disponibilidade de um espaço pelo slug.
export function buscarDisponibilidadePorSlug(slug) {
  return (
    disponibilidadeMock[slug] ?? {
      datasIndisponiveis: [],
      horariosIndisponiveisPorData: {},
    }
  );
}
