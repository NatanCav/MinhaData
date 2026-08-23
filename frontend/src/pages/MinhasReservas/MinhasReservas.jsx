import { useEffect, useState } from "react";
import Container from "../../components/ui/Container";
import SectionTitle from "../../components/ui/SectionTitle";
import EmptyState from "../../components/ui/EmptyState";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import Toast from "../../components/ui/Toast";
import { IconeCalendario, IconeRelogio } from "../../components/ui/Icones";
import {
  cancelarReserva,
  getReservasDoUsuario,
  podeCancelarReserva,
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
    month: "long",
    year: "numeric",
  });
}

function formatarHorario(reserva) {
  return reserva.espaco.unidadePreco === "hora"
    ? reserva.horarioInicio
    : `${reserva.horarioInicio} às ${reserva.horarioFim}`;
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

export default function MinhasReservas() {
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [cancelandoId, setCancelandoId] = useState(null);
  const [toast, setToast] = useState({ visivel: false, mensagem: "", tom: "sucesso" });

  useEffect(() => {
    getReservasDoUsuario()
      .then((dados) => setReservas(dados))
      .catch(() => setErro("Não foi possível carregar suas reservas."))
      .finally(() => setCarregando(false));
  }, []);

  async function handleCancelar(id) {
    setCancelandoId(id);
    try {
      const reservaAtualizada = await cancelarReserva(id);
      setReservas((atual) =>
        atual.map((reserva) => (reserva.id === id ? reservaAtualizada : reserva))
      );
      setToast({
        visivel: true,
        mensagem: "Reserva cancelada com sucesso.",
        tom: "sucesso",
      });
    } catch (erroCancelamento) {
      setToast({
        visivel: true,
        mensagem: erroCancelamento.message || "Não foi possível cancelar a reserva.",
        tom: "erro",
      });
    } finally {
      setCancelandoId(null);
    }
  }

  return (
    <div className="bg-gray-50">
      <Container as="main" className="py-8">
        <SectionTitle
          nivel="pagina"
          subtitulo="Acompanhe o status das suas solicitações de reserva."
          className="mb-8"
        >
          Minhas reservas
        </SectionTitle>

        {carregando && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }, (_, indice) => (
              <EsqueletoReserva key={indice} />
            ))}
          </div>
        )}

        {!carregando && erro && <EmptyState mensagem={erro} tom="erro" />}

        {!carregando && !erro && reservas.length === 0 && (
          <EmptyState
            mensagem="Você ainda não possui reservas."
            linkTo="/espacos"
            linkLabel="Ver espaços disponíveis"
          />
        )}

        {!carregando && !erro && reservas.length > 0 && (
          <div className="flex flex-col gap-4">
            {reservas.map((reserva) => (
              <Card
                key={reserva.id}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-bold text-gray-800">
                      {reserva.espaco.nome}
                    </p>
                    <Badge tom={STATUS_TOM[reserva.status]}>
                      {STATUS_LABEL[reserva.status]}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <IconeCalendario className="h-4 w-4" />
                      {formatarData(reserva.data)}
                    </span>
                    <span className="flex items-center gap-2">
                      <IconeRelogio className="h-4 w-4" />
                      {formatarHorario(reserva)}
                    </span>
                  </div>
                </div>

                {podeCancelarReserva(reserva.status) && (
                  <Button
                    variante="secundario"
                    carregando={cancelandoId === reserva.id}
                    disabled={cancelandoId === reserva.id}
                    onClick={() => handleCancelar(reserva.id)}
                    className="sm:shrink-0"
                  >
                    Cancelar reserva
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </Container>

      <Toast
        mensagem={toast.mensagem}
        tom={toast.tom}
        visivel={toast.visivel}
        onFechar={() => setToast((atual) => ({ ...atual, visivel: false }))}
      />
    </div>
  );
}
