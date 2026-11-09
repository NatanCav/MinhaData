import { useEffect, useMemo, useState } from "react";
import SectionTitle from "../../components/ui/SectionTitle";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import Toast from "../../components/ui/Toast";
import { IconeCalendario, IconeRelogio } from "../../components/ui/Icones";
import { useToast } from "../../hooks/useToast";
import {
  aprovarReserva,
  atualizarObservacoesProprietario,
  cancelarReservaProprietario,
  getReservasDoProprietario,
  podeCancelarReserva,
  recusarReserva,
} from "../../services/reservasService";

const STATUS_LABEL = {
  pendente: "Pendente",
  confirmada: "Confirmada",
  recusada: "Recusada",
  cancelada: "Cancelada",
};

const STATUS_TOM = {
  pendente: "amber",
  confirmada: "emerald",
  recusada: "red",
  cancelada: "red",
};

function formatarData(data) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ObservacaoProprietario({ reserva, onSalvo, onErro }) {
  const [valor, setValor] = useState(reserva.observacoesProprietario || "");
  const [salvando, setSalvando] = useState(false);

  const alterado = valor !== (reserva.observacoesProprietario || "");

  async function handleSalvar() {
    setSalvando(true);
    try {
      const reservaAtualizada = await atualizarObservacoesProprietario(reserva.id, valor);
      onSalvo(reservaAtualizada);
    } catch (erro) {
      onErro(erro.message || "Não foi possível salvar a observação.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
      <label htmlFor={`observacao-${reserva.id}`} className="text-xs font-medium text-gray-500">
        Observação (só você vê — ex.: valor combinado, sinal, etc.)
      </label>
      <textarea
        id={`observacao-${reserva.id}`}
        rows={2}
        value={valor}
        onChange={(evento) => setValor(evento.target.value)}
        placeholder="Ex.: Cobrado R$ 850 (combinado direto com o cliente)."
        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
      />
      {alterado && (
        <Button
          variante="secundario"
          carregando={salvando}
          disabled={salvando}
          onClick={handleSalvar}
          className="self-end"
        >
          Salvar observação
        </Button>
      )}
    </div>
  );
}

function EsqueletoReserva() {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
    </Card>
  );
}

export default function PainelReservas() {
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [acaoEmAndamentoId, setAcaoEmAndamentoId] = useState(null);
  const [filtroEspaco, setFiltroEspaco] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const { toast, mostrarToast, fecharToast } = useToast();

  useEffect(() => {
    getReservasDoProprietario()
      .then((dados) => setReservas(dados))
      .catch(() => setErro("Não foi possível carregar as reservas."))
      .finally(() => setCarregando(false));
  }, []);

  const espacosDisponiveis = useMemo(() => {
    const mapa = new Map();
    reservas.forEach((reserva) => mapa.set(reserva.espaco.slug, reserva.espaco.nome));
    return Array.from(mapa, ([slug, nome]) => ({ slug, nome }));
  }, [reservas]);

  const reservasFiltradas = reservas.filter((reserva) => {
    if (filtroEspaco && reserva.espaco.slug !== filtroEspaco) return false;
    if (filtroStatus && reserva.status !== filtroStatus) return false;
    return true;
  });

  async function executarAcao(id, acao, mensagemSucesso, mensagemErroPadrao) {
    setAcaoEmAndamentoId(id);
    try {
      const reservaAtualizada = await acao(id);
      setReservas((atual) =>
        atual.map((reserva) => (reserva.id === id ? reservaAtualizada : reserva))
      );
      mostrarToast(mensagemSucesso, "sucesso");
    } catch (erroAcao) {
      mostrarToast(erroAcao.message || mensagemErroPadrao, "erro");
    } finally {
      setAcaoEmAndamentoId(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionTitle
        nivel="pagina"
        subtitulo="Aprove, recuse ou cancele as solicitações dos seus clientes."
      >
        Reservas
      </SectionTitle>

      {!carregando && !erro && reservas.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Select
            id="filtro-espaco"
            label="Espaço"
            value={filtroEspaco}
            onChange={(evento) => setFiltroEspaco(evento.target.value)}
            className="sm:w-64"
          >
            <option value="">Todos os espaços</option>
            {espacosDisponiveis.map((espaco) => (
              <option key={espaco.slug} value={espaco.slug}>
                {espaco.nome}
              </option>
            ))}
          </Select>

          <Select
            id="filtro-status"
            label="Status"
            value={filtroStatus}
            onChange={(evento) => setFiltroStatus(evento.target.value)}
            className="sm:w-48"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABEL).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </Select>
        </div>
      )}

      {carregando && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }, (_, indice) => (
            <EsqueletoReserva key={indice} />
          ))}
        </div>
      )}

      {!carregando && erro && <EmptyState mensagem={erro} tom="erro" />}

      {!carregando && !erro && reservas.length === 0 && (
        <EmptyState mensagem="Nenhuma reserva foi feita nos seus espaços ainda." />
      )}

      {!carregando && !erro && reservas.length > 0 && reservasFiltradas.length === 0 && (
        <EmptyState mensagem="Nenhuma reserva encontrada com esses filtros." />
      )}

      {!carregando && !erro && reservasFiltradas.length > 0 && (
        <div className="flex flex-col gap-4">
          {reservasFiltradas.map((reserva) => {
            const emAndamento = acaoEmAndamentoId === reserva.id;

            return (
              <Card key={reserva.id} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-bold text-gray-800">
                      {reserva.espaco.nome}
                    </p>
                    <Badge tom={STATUS_TOM[reserva.status]}>
                      {STATUS_LABEL[reserva.status]}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600">
                    {reserva.nomeCliente} · {reserva.emailCliente}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <IconeCalendario className="h-4 w-4" />
                      {formatarData(reserva.data)}
                    </span>
                    <span className="flex items-center gap-2">
                      <IconeRelogio className="h-4 w-4" />
                      {reserva.horarioInicio} às {reserva.horarioFim}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {reserva.status === "pendente" && (
                    <>
                      <Button
                        carregando={emAndamento}
                        disabled={emAndamento}
                        onClick={() =>
                          executarAcao(
                            reserva.id,
                            aprovarReserva,
                            "Reserva aprovada com sucesso.",
                            "Não foi possível aprovar a reserva."
                          )
                        }
                      >
                        Aprovar
                      </Button>
                      <Button
                        variante="secundario"
                        disabled={emAndamento}
                        onClick={() =>
                          executarAcao(
                            reserva.id,
                            recusarReserva,
                            "Reserva recusada com sucesso.",
                            "Não foi possível recusar a reserva."
                          )
                        }
                      >
                        Recusar
                      </Button>
                    </>
                  )}

                  {podeCancelarReserva(reserva.status) && (
                    <Button
                      variante="secundario"
                      disabled={emAndamento}
                      onClick={() =>
                        executarAcao(
                          reserva.id,
                          cancelarReservaProprietario,
                          "Reserva cancelada com sucesso.",
                          "Não foi possível cancelar a reserva."
                        )
                      }
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>

              <ObservacaoProprietario
                reserva={reserva}
                onSalvo={(reservaAtualizada) => {
                  setReservas((atual) =>
                    atual.map((item) => (item.id === reservaAtualizada.id ? reservaAtualizada : item))
                  );
                  mostrarToast("Observação salva.", "sucesso");
                }}
                onErro={(mensagem) => mostrarToast(mensagem, "erro")}
              />
              </Card>
            );
          })}
        </div>
      )}

      <Toast
        mensagem={toast.mensagem}
        tom={toast.tom}
        visivel={toast.visivel}
        onFechar={fecharToast}
      />
    </div>
  );
}
