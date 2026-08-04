import { useEffect, useState } from "react";
import { getEspacos } from "../../services/espacosService";
import EspacoCard from "../ui/EspacoCard";
import SectionTitle from "../ui/SectionTitle";
import Skeleton from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";
import Card from "../ui/Card";

const QUANTIDADE_DESTAQUE = 3;

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

export default function VitrineEspacos() {
  const [espacos, setEspacos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    getEspacos()
      .then((data) => setEspacos(data.slice(0, QUANTIDADE_DESTAQUE)))
      .catch(() => setErro("Não foi possível carregar os espaços."))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <section id="espacos" className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <SectionTitle
          nivel="destaque"
          centralizado
          subtitulo="Uma amostra dos espaços disponíveis para reservar agora."
          className="mb-8"
        >
          Espaços em destaque
        </SectionTitle>

        {carregando && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: QUANTIDADE_DESTAQUE }, (_, indice) => (
              <EsqueletoCard key={indice} />
            ))}
          </div>
        )}

        {!carregando && erro && <EmptyState mensagem={erro} tom="erro" />}

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
      </div>
    </section>
  );
}
