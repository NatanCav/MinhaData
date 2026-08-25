import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SectionTitle from "../../components/ui/SectionTitle";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { getReservasDoProprietario } from "../../services/reservasService";
import { getEspacosDoProprietario } from "../../services/espacosService";

export default function Painel() {
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    Promise.all([getReservasDoProprietario(), getEspacosDoProprietario()])
      .then(([reservas, espacos]) => {
        setResumo({
          pendentes: reservas.filter((r) => r.status === "pendente").length,
          confirmadas: reservas.filter((r) => r.status === "confirmada").length,
          espacos: espacos.length,
        });
      })
      .catch(() => setErro("Não foi possível carregar o resumo do painel."))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <SectionTitle
        nivel="pagina"
        subtitulo="Acompanhe reservas e espaços em um só lugar."
      >
        Painel de gestão
      </SectionTitle>

      {carregando && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, indice) => (
            <Card key={indice} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </Card>
          ))}
        </div>
      )}

      {!carregando && erro && <EmptyState mensagem={erro} tom="erro" />}

      {!carregando && !erro && resumo && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card as={Link} to="/gestao/reservas" hover className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">Reservas pendentes</span>
            <span className="text-2xl font-bold text-amber-700">
              {resumo.pendentes}
            </span>
          </Card>

          <Card as={Link} to="/gestao/reservas" hover className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">Reservas confirmadas</span>
            <span className="text-2xl font-bold text-emerald-700">
              {resumo.confirmadas}
            </span>
          </Card>

          <Card as={Link} to="/gestao/espacos" hover className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">Espaços cadastrados</span>
            <span className="text-2xl font-bold text-gray-800">
              {resumo.espacos}
            </span>
          </Card>
        </div>
      )}
    </div>
  );
}
