import { useEffect, useState } from "react";
import { getEspacos } from "../../services/espacosService";
import EspacoCard from "../../components/ui/EspacoCard";
import Container from "../../components/ui/Container";
import SectionTitle from "../../components/ui/SectionTitle";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import Card from "../../components/ui/Card";

const QUANTIDADE_ESQUELETOS = 6;

function EsqueletoCard() {
  return (
    <Card padding="" className="flex flex-col overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </Card>
  );
}

export default function Vitrine() {
  const [espacos, setEspacos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    getEspacos()
      .then((data) => setEspacos(data))
      .catch(() => setErro("Não foi possível carregar os espaços."))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="bg-gray-50">
      <Container as="main" className="py-8">
        <SectionTitle
          nivel="pagina"
          subtitulo="Chácaras, salões e quiosques com reserva simplificada."
          className="mb-8"
        >
          Encontre o espaço ideal para o seu evento
        </SectionTitle>

        {carregando && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: QUANTIDADE_ESQUELETOS }, (_, indice) => (
              <EsqueletoCard key={indice} />
            ))}
          </div>
        )}

        {!carregando && erro && (
          <EmptyState mensagem={erro} tom="erro" />
        )}

        {!carregando && !erro && espacos.length === 0 && (
          <EmptyState mensagem="Nenhum espaço disponível no momento." />
        )}

        {!carregando && !erro && espacos.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {espacos.map((espaco) => (
              <EspacoCard key={espaco.id} espaco={espaco} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
