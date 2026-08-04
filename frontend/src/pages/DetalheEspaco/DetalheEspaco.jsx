import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEspacoPorSlug } from "../../services/espacosService";
import CardReserva from "../../components/ui/CardReserva";
import Container from "../../components/ui/Container";
import SectionTitle from "../../components/ui/SectionTitle";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { IconeCheck, IconeEstrela } from "../../components/ui/Icones";

function FadeIn({ children, className = "" }) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const quadro = requestAnimationFrame(() => setVisivel(true));
    return () => cancelAnimationFrame(quadro);
  }, []);

  return (
    <div
      className={`transition-opacity duration-300 ${
        visivel ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function EsqueletoDetalhe() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-64 w-full rounded-2xl md:h-96" />
          <div className="grid grid-cols-4 gap-2">
            {["a", "b", "c", "d"].map((chave) => (
              <Skeleton key={chave} className="h-16 rounded-lg md:h-20" />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-6">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {["a", "b", "c", "d"].map((chave) => (
              <Skeleton key={chave} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-80">
        <Card className="flex flex-col gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </Card>
      </div>
    </div>
  );
}

export default function DetalheEspaco() {
  const { slug } = useParams();
  const [espaco, setEspaco] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [imagemAtiva, setImagemAtiva] = useState(0);

  useEffect(() => {
    getEspacoPorSlug(slug)
      .then((data) => {
        setEspaco(data);
        setImagemAtiva(0);
      })
      .catch(() => setErro("Não foi possível encontrar esse espaço."))
      .finally(() => setCarregando(false));
  }, [slug]);

  return (
    <div className="bg-gray-50">
      <Container as="main" className="py-8">
        {carregando && <EsqueletoDetalhe />}

        {!carregando && erro && (
          <EmptyState
            mensagem={erro}
            tom="erro"
            linkTo="/espacos"
            linkLabel="Voltar para os espaços"
          />
        )}

        {!carregando && !erro && !espaco && (
          <EmptyState
            mensagem="Este espaço não está mais disponível."
            linkTo="/espacos"
            linkLabel="Voltar para os espaços"
          />
        )}

        {!carregando && !erro && espaco && (
          <FadeIn key={espaco.id} className="flex flex-col gap-8 lg:flex-row">
            <article className="flex flex-1 flex-col gap-6">
              <div className="flex flex-col gap-2">
                <img
                  src={espaco.galeria[imagemAtiva]}
                  alt={espaco.nome}
                  className="h-64 w-full rounded-2xl object-cover shadow-md md:h-96"
                />

                {espaco.galeria.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {espaco.galeria.slice(0, 4).map((foto, indice) => {
                      const restantes = espaco.galeria.length - 4;
                      const ehUltimaComMais = indice === 3 && restantes > 0;

                      return (
                        <button
                          key={foto}
                          type="button"
                          onClick={() => setImagemAtiva(indice)}
                          aria-label={`Ver foto ${indice + 1} de ${espaco.nome}`}
                          aria-pressed={imagemAtiva === indice}
                          className={`relative h-16 overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 md:h-20 ${
                            imagemAtiva === indice
                              ? "border-emerald-600"
                              : "border-transparent"
                          }`}
                        >
                          <img
                            src={foto}
                            alt={`${espaco.nome} - foto ${indice + 1}`}
                            className="h-full w-full object-cover"
                          />
                          {ehUltimaComMais && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                              +{restantes} fotos
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {espaco.tipo}
                </span>
                <h1 className="text-2xl font-bold text-gray-900">{espaco.nome}</h1>
                <p className="text-sm text-gray-500">{espaco.localizacao}</p>

                <div className="flex items-center gap-1 text-sm">
                  <IconeEstrela className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-gray-800">
                    {espaco.avaliacao.nota.toFixed(1).replace(".", ",")}
                  </span>
                  <span className="text-gray-400">
                    ({espaco.avaliacao.totalAvaliacoes} avaliações)
                  </span>
                </div>

                <p className="text-sm text-gray-500 md:text-base">
                  {espaco.descricao}
                </p>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-6">
                <SectionTitle>Comodidades</SectionTitle>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {espaco.comodidades.map((comodidade) => (
                    <div
                      key={comodidade.id}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <IconeCheck className="h-4 w-4 text-emerald-600" />
                      {comodidade.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-6">
                <SectionTitle>Informações importantes</SectionTitle>
                <ul className="flex flex-col gap-2">
                  {espaco.informacoes.map((informacao) => (
                    <li
                      key={informacao}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <IconeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {informacao}
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <aside className="w-full lg:w-80">
              <div className="lg:sticky lg:top-24">
                <CardReserva espaco={espaco} />
              </div>
            </aside>
          </FadeIn>
        )}
      </Container>
    </div>
  );
}
