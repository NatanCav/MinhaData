import { useState } from "react";
import { IconeSetaDireita, IconeSetaEsquerda } from "./Icones";

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const NOMES_MES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function paraISO(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function inicioDoDia(data) {
  const copia = new Date(data);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

export default function Calendario({
  dataSelecionada,
  onSelecionarData,
  datasIndisponiveis = [],
  desabilitado = false,
}) {
  const hoje = inicioDoDia(new Date());
  const [mesExibido, setMesExibido] = useState(() => {
    const base = dataSelecionada ? new Date(`${dataSelecionada}T00:00:00`) : hoje;
    return { ano: base.getFullYear(), mes: base.getMonth() };
  });

  const totalDias = new Date(mesExibido.ano, mesExibido.mes + 1, 0).getDate();
  const offsetInicial = new Date(mesExibido.ano, mesExibido.mes, 1).getDay();
  const mesAnteriorDesabilitado =
    mesExibido.ano === hoje.getFullYear() && mesExibido.mes === hoje.getMonth();

  function mudarMes(delta) {
    setMesExibido((atual) => {
      const novaData = new Date(atual.ano, atual.mes + delta, 1);
      return { ano: novaData.getFullYear(), mes: novaData.getMonth() };
    });
  }

  const celulas = Array.from({ length: offsetInicial }, () => null).concat(
    Array.from({ length: totalDias }, (_, indice) => indice + 1)
  );

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => mudarMes(-1)}
          disabled={desabilitado || mesAnteriorDesabilitado}
          aria-label="Mês anterior"
          className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-emerald-100 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <IconeSetaEsquerda className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {NOMES_MES[mesExibido.mes]} {mesExibido.ano}
        </span>
        <button
          type="button"
          onClick={() => mudarMes(1)}
          disabled={desabilitado}
          aria-label="Próximo mês"
          className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-emerald-100 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <IconeSetaDireita className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400">
        {DIAS_SEMANA.map((dia, indice) => (
          <span key={`${dia}-${indice}`}>{dia}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {celulas.map((dia, indice) => {
          if (dia === null) return <span key={`vazio-${indice}`} />;

          const iso = paraISO(mesExibido.ano, mesExibido.mes, dia);
          const noPassado = new Date(mesExibido.ano, mesExibido.mes, dia) < hoje;
          const indisponivel = datasIndisponiveis.includes(iso);
          const selecionado = dataSelecionada === iso;
          const inativo = desabilitado || noPassado || indisponivel;

          return (
            <button
              key={iso}
              type="button"
              disabled={inativo}
              onClick={() => onSelecionarData(iso)}
              aria-label={`Selecionar ${dia} de ${NOMES_MES[mesExibido.mes]}`}
              aria-pressed={selecionado}
              className={`aspect-square rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
                selecionado
                  ? "bg-emerald-700 text-white"
                  : inativo
                  ? "text-gray-300 line-through"
                  : "text-gray-700 hover:bg-emerald-100 hover:text-emerald-700"
              }`}
            >
              {dia}
            </button>
          );
        })}
      </div>
    </div>
  );
}
