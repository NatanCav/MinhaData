import { useEffect, useMemo, useState } from "react";
import SectionTitle from "../../components/ui/SectionTitle";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { IconeRelogio, IconeSetaDireita, IconeSetaEsquerda } from "../../components/ui/Icones";
import { getEspacosDoProprietario } from "../../services/espacosService";
import { getReservasDoProprietario } from "../../services/reservasService";

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

const STATUS_LABEL = { pendente: "Pendente", confirmada: "Confirmada" };
const STATUS_TOM = { pendente: "amber", confirmada: "emerald" };

function paraISO(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function inicioDoDia(data) {
  const copia = new Date(data);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function formatarDataExtenso(iso) {
  const [ano, mes, dia] = iso.split("-");
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function EsqueletoCalendario() {
  return (
    <Card className="flex flex-col gap-3">
      <Skeleton className="h-6 w-40" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }, (_, indice) => (
          <Skeleton key={indice} className="aspect-square" />
        ))}
      </div>
    </Card>
  );
}

export default function PainelCalendario() {
  const [espacos, setEspacos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [espacoSelecionado, setEspacoSelecionado] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  const hoje = inicioDoDia(new Date());
  const [mesExibido, setMesExibido] = useState({ ano: hoje.getFullYear(), mes: hoje.getMonth() });

  useEffect(() => {
    Promise.all([getEspacosDoProprietario(), getReservasDoProprietario()])
      .then(([dadosEspacos, dadosReservas]) => {
        setEspacos(dadosEspacos);
        setReservas(dadosReservas);
        if (dadosEspacos.length > 0) setEspacoSelecionado(dadosEspacos[0].slug);
      })
      .catch(() => setErro("Não foi possível carregar o calendário."))
      .finally(() => setCarregando(false));
  }, []);

  const reservasPorData = useMemo(() => {
    const mapa = new Map();
    reservas
      .filter((reserva) => reserva.espaco.slug === espacoSelecionado)
      .filter((reserva) => reserva.status === "pendente" || reserva.status === "confirmada")
      .forEach((reserva) => {
        const lista = mapa.get(reserva.data) || [];
        lista.push(reserva);
        mapa.set(reserva.data, lista);
      });
    return mapa;
  }, [reservas, espacoSelecionado]);

  function mudarMes(delta) {
    setMesExibido((atual) => {
      const novaData = new Date(atual.ano, atual.mes + delta, 1);
      return { ano: novaData.getFullYear(), mes: novaData.getMonth() };
    });
    setDiaSelecionado(null);
  }

  const totalDias = new Date(mesExibido.ano, mesExibido.mes + 1, 0).getDate();
  const offsetInicial = new Date(mesExibido.ano, mesExibido.mes, 1).getDay();
  const celulas = Array.from({ length: offsetInicial }, () => null).concat(
    Array.from({ length: totalDias }, (_, indice) => indice + 1)
  );

  const reservasDoDia = diaSelecionado ? reservasPorData.get(diaSelecionado) || [] : [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle
          nivel="pagina"
          subtitulo="Veja de relance quais datas já estão reservadas e quais ainda estão livres."
        >
          Calendário
        </SectionTitle>

        {espacos.length > 1 && (
          <Select
            id="filtro-espaco-calendario"
            label="Espaço"
            value={espacoSelecionado}
            onChange={(evento) => {
              setEspacoSelecionado(evento.target.value);
              setDiaSelecionado(null);
            }}
            className="sm:w-64"
          >
            {espacos.map((espaco) => (
              <option key={espaco.slug} value={espaco.slug}>
                {espaco.nome}
              </option>
            ))}
          </Select>
        )}
      </div>

      {carregando && <EsqueletoCalendario />}

      {!carregando && erro && <EmptyState mensagem={erro} tom="erro" />}

      {!carregando && !erro && espacos.length === 0 && (
        <EmptyState
          mensagem="Cadastre um espaço para acompanhar o calendário de reservas."
          linkTo="/gestao/espacos/novo"
          linkLabel="Cadastrar o primeiro espaço"
        />
      )}

      {!carregando && !erro && espacos.length > 0 && (
        <div className="flex flex-col gap-6 lg:flex-row">
          <Card className="flex flex-1 flex-col gap-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => mudarMes(-1)}
                aria-label="Mês anterior"
                className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-emerald-100 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                <IconeSetaEsquerda className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-gray-800">
                {NOMES_MES[mesExibido.mes]} {mesExibido.ano}
              </span>
              <button
                type="button"
                onClick={() => mudarMes(1)}
                aria-label="Próximo mês"
                className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-emerald-100 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
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
                const reservasDoDiaAtual = reservasPorData.get(iso) || [];
                const temConfirmada = reservasDoDiaAtual.some((r) => r.status === "confirmada");
                const temPendente = reservasDoDiaAtual.some((r) => r.status === "pendente");
                const selecionado = diaSelecionado === iso;

                let estilo = "text-gray-700 hover:bg-gray-100";
                if (temConfirmada) estilo = "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
                else if (temPendente) estilo = "bg-amber-100 text-amber-800 hover:bg-amber-200";

                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setDiaSelecionado(selecionado ? null : iso)}
                    aria-label={`${dia} de ${NOMES_MES[mesExibido.mes]}${
                      reservasDoDiaAtual.length > 0 ? ", com reserva" : ", disponível"
                    }`}
                    aria-pressed={selecionado}
                    className={`relative aspect-square rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                      selecionado ? "ring-2 ring-emerald-600" : ""
                    } ${estilo}`}
                  >
                    {dia}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-gray-100" /> Disponível
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-amber-200" /> Reserva pendente
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-200" /> Reserva confirmada
              </span>
            </div>
          </Card>

          <Card className="flex w-full flex-col gap-3 lg:w-80">
            {!diaSelecionado && (
              <p className="text-sm text-gray-500">
                Selecione um dia no calendário para ver os detalhes das reservas.
              </p>
            )}

            {diaSelecionado && (
              <>
                <p className="text-sm font-semibold text-gray-800">
                  {formatarDataExtenso(diaSelecionado)}
                </p>

                {reservasDoDia.length === 0 && (
                  <p className="text-sm text-gray-500">Nenhuma reserva neste dia — disponível.</p>
                )}

                {reservasDoDia.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {reservasDoDia.map((reserva) => (
                      <div
                        key={reserva.id}
                        className="flex flex-col gap-1 rounded-lg border border-gray-100 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-gray-800">
                            {reserva.nomeCliente}
                          </span>
                          <Badge tom={STATUS_TOM[reserva.status]}>
                            {STATUS_LABEL[reserva.status]}
                          </Badge>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <IconeRelogio className="h-3.5 w-3.5" />
                          {reserva.horarioInicio} às {reserva.horarioFim}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
