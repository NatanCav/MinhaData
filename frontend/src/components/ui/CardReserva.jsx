import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconeRelogio } from "./Icones";
import Calendario from "./Calendario";
import Button from "./Button";
import Badge from "./Badge";
import Card from "./Card";
import Skeleton from "./Skeleton";
import { getDisponibilidade } from "../../services/disponibilidadeService";
import { useReserva } from "../../context/useReserva";

const HORARIOS_DISPONIVEIS = [
  "08:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
];

const ATRASO_VERIFICACAO_MS = 600;

export default function CardReserva({ espaco }) {
  const { preco, unidadePreco, disponivel, slug } = espaco;
  const porHora = unidadePreco === "hora";

  const navigate = useNavigate();
  const { iniciarReserva } = useReserva();

  const [data, setData] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("08:00");
  const [horarioFim, setHorarioFim] = useState("18:00");
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [erros, setErros] = useState({});
  const [verificando, setVerificando] = useState(false);

  const [disponibilidade, setDisponibilidade] = useState({
    datasIndisponiveis: [],
    horariosIndisponiveisPorData: {},
  });
  const [carregandoDisponibilidade, setCarregandoDisponibilidade] = useState(true);
  const [erroDisponibilidade, setErroDisponibilidade] = useState(null);

  useEffect(() => {
    getDisponibilidade(slug)
      .then((dados) => setDisponibilidade(dados))
      .catch(() => setErroDisponibilidade("Não foi possível carregar a agenda."))
      .finally(() => setCarregandoDisponibilidade(false));
  }, [slug]);

  const horariosDaData = data
    ? HORARIOS_DISPONIVEIS.filter(
        (horario) =>
          !(disponibilidade.horariosIndisponiveisPorData[data] || []).includes(
            horario
          )
      )
    : HORARIOS_DISPONIVEIS;

  function selecionarData(novaData) {
    setData(novaData);
    setHorarioSelecionado(null);
    setErros((atual) => ({ ...atual, data: null, horario: null }));
  }

  function validar() {
    const novosErros = {};

    if (!data) {
      novosErros.data = "Selecione uma data para continuar.";
    }

    if (porHora && !horarioSelecionado) {
      novosErros.horario = "Selecione um horário disponível.";
    }

    if (!porHora && horarioInicio && horarioFim && horarioFim <= horarioInicio) {
      novosErros.horario = "O horário final deve ser depois do inicial.";
    }

    return novosErros;
  }

  function handleVerDisponibilidade(evento) {
    evento.preventDefault();
    if (!disponivel || verificando) return;

    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setVerificando(true);
    setTimeout(() => {
      setVerificando(false);
      iniciarReserva({
        espaco,
        data,
        horario: porHora ? horarioSelecionado : `${horarioInicio} às ${horarioFim}`,
      });
      navigate("/reserva");
    }, ATRASO_VERIFICACAO_MS);
  }

  return (
    <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-800">
            R$ {preco.toFixed(2)}
            <span className="text-sm font-normal text-gray-400"> /{unidadePreco}</span>
          </p>
          <Badge tom={disponivel ? "emerald" : "red"}>
            {disponivel ? "Disponível" : "Indisponível"}
          </Badge>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Escolha a data</span>

          {carregandoDisponibilidade && (
            <Skeleton className="h-56 w-full rounded-lg" />
          )}

          {!carregandoDisponibilidade && erroDisponibilidade && (
            <p className="text-xs text-red-500">{erroDisponibilidade}</p>
          )}

          {!carregandoDisponibilidade && !erroDisponibilidade && (
            <Calendario
              dataSelecionada={data}
              onSelecionarData={selecionarData}
              datasIndisponiveis={disponibilidade.datasIndisponiveis}
              desabilitado={!disponivel}
            />
          )}
          {erros.data && <p className="text-xs text-red-500">{erros.data}</p>}
        </div>

        {porHora ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Horário</span>
            {!data && (
              <p className="text-xs text-gray-400">Selecione uma data primeiro.</p>
            )}
            <div className="flex flex-wrap gap-2">
              {HORARIOS_DISPONIVEIS.map((horario) => {
                const indisponivel = !horariosDaData.includes(horario);
                return (
                  <button
                    key={horario}
                    type="button"
                    disabled={!disponivel || !data || indisponivel}
                    aria-pressed={horarioSelecionado === horario}
                    onClick={() => {
                      setHorarioSelecionado(horario);
                      setErros((atual) => ({ ...atual, horario: null }));
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      indisponivel ? "line-through" : ""
                    } ${
                      horarioSelecionado === horario
                        ? "bg-emerald-700 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700"
                    }`}
                  >
                    {horario}
                  </button>
                );
              })}
            </div>
            {erros.horario && <p className="text-xs text-red-500">{erros.horario}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Horário</span>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <IconeRelogio className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="time"
                  aria-label="Horário de início"
                  value={horarioInicio}
                  disabled={!disponivel}
                  onChange={(evento) => {
                    setHorarioInicio(evento.target.value);
                    setErros((atual) => ({ ...atual, horario: null }));
                  }}
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-2 text-sm text-gray-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <span className="text-sm text-gray-400">até</span>
              <div className="relative flex-1">
                <IconeRelogio className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="time"
                  aria-label="Horário de término"
                  value={horarioFim}
                  disabled={!disponivel}
                  onChange={(evento) => {
                    setHorarioFim(evento.target.value);
                    setErros((atual) => ({ ...atual, horario: null }));
                  }}
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-2 text-sm text-gray-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            {erros.horario && <p className="text-xs text-red-500">{erros.horario}</p>}
          </div>
        )}

      <Button
        onClick={handleVerDisponibilidade}
        disabled={!disponivel}
        carregando={verificando}
        className="w-full"
      >
        {disponivel ? "Ver disponibilidade" : "Indisponível"}
      </Button>
    </Card>
  );
}
