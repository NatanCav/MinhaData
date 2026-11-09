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

// Espaços cobrados por dia têm horário de funcionamento fixo — o cliente só
// escolhe a(s) data(s), não o horário.
const HORARIO_FIXO_INICIO = "09:00";
const HORARIO_FIXO_FIM = "20:00";

const ATRASO_VERIFICACAO_MS = 600;
const DURACAO_SLOT_HORAS = 2;

function somarHoras(horario, horas) {
  const [h, m] = horario.split(":").map(Number);
  const novaHora = (h + horas) % 24;
  return `${String(novaHora).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function CardReserva({ espaco }) {
  const { preco, unidadePreco, disponivel, slug } = espaco;
  const porHora = unidadePreco === "hora";

  const navigate = useNavigate();
  const { iniciarReserva } = useReserva();

  const [datas, setDatas] = useState([]);
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

  // Só mostra horários livres em TODAS as datas selecionadas.
  const horariosDisponiveisParaSelecao = HORARIOS_DISPONIVEIS.filter((horario) =>
    datas.every(
      (data) => !(disponibilidade.horariosIndisponiveisPorData[data] || []).includes(horario)
    )
  );

  function alternarData(novaData) {
    setDatas((atual) =>
      atual.includes(novaData)
        ? atual.filter((item) => item !== novaData)
        : [...atual, novaData].sort()
    );
    setHorarioSelecionado(null);
    setErros((atual) => ({ ...atual, datas: null, horario: null }));
  }

  function validar() {
    const novosErros = {};

    if (datas.length === 0) {
      novosErros.datas = "Selecione ao menos uma data para continuar.";
    }

    if (porHora && !horarioSelecionado) {
      novosErros.horario = "Selecione um horário disponível.";
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
        datas,
        horario: porHora
          ? horarioSelecionado
          : `${HORARIO_FIXO_INICIO} às ${HORARIO_FIXO_FIM}`,
        horarioInicio: porHora ? horarioSelecionado : HORARIO_FIXO_INICIO,
        horarioFim: porHora ? somarHoras(horarioSelecionado, DURACAO_SLOT_HORAS) : HORARIO_FIXO_FIM,
      });
      navigate("/reserva");
    }, ATRASO_VERIFICACAO_MS);
  }

  const total = preco * datas.length;

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
          <span className="text-sm font-medium text-gray-700">
            Escolha a(s) data(s)
          </span>

          {carregandoDisponibilidade && (
            <Skeleton className="h-56 w-full rounded-lg" />
          )}

          {!carregandoDisponibilidade && erroDisponibilidade && (
            <p className="text-xs text-red-500">{erroDisponibilidade}</p>
          )}

          {!carregandoDisponibilidade && !erroDisponibilidade && (
            <Calendario
              datasSelecionadas={datas}
              onSelecionarData={alternarData}
              datasIndisponiveis={disponibilidade.datasIndisponiveis}
              desabilitado={!disponivel}
            />
          )}
          {erros.datas && <p className="text-xs text-red-500">{erros.datas}</p>}
        </div>

        {porHora ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Horário</span>
            {datas.length === 0 && (
              <p className="text-xs text-gray-400">Selecione uma data primeiro.</p>
            )}
            <div className="flex flex-wrap gap-2">
              {HORARIOS_DISPONIVEIS.map((horario) => {
                const indisponivel = !horariosDisponiveisParaSelecao.includes(horario);
                return (
                  <button
                    key={horario}
                    type="button"
                    disabled={!disponivel || datas.length === 0 || indisponivel}
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
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <IconeRelogio className="h-4 w-4 text-gray-400" />
              {HORARIO_FIXO_INICIO} às {HORARIO_FIXO_FIM}
            </p>
          </div>
        )}

        {datas.length > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-sm text-gray-500">
              {datas.length} datas selecionadas
            </span>
            <span className="text-sm font-semibold text-gray-800">
              Total: R$ {total.toFixed(2)}
            </span>
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
