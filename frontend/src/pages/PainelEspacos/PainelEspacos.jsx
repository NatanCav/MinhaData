import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SectionTitle from "../../components/ui/SectionTitle";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { getEspacosDoProprietario } from "../../services/espacosService";

function EsqueletoEspaco() {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-32" />
    </Card>
  );
}

export default function PainelEspacos() {
  const [espacos, setEspacos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    getEspacosDoProprietario()
      .then((dados) => setEspacos(dados))
      .catch(() => setErro("Não foi possível carregar os espaços."))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle nivel="pagina" subtitulo="Cadastre e edite os espaços disponíveis para reserva.">
          Espaços
        </SectionTitle>

        <Button as={Link} to="/gestao/espacos/novo" className="shrink-0">
          Cadastrar espaço
        </Button>
      </div>

      {carregando && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }, (_, indice) => (
            <EsqueletoEspaco key={indice} />
          ))}
        </div>
      )}

      {!carregando && erro && <EmptyState mensagem={erro} tom="erro" />}

      {!carregando && !erro && espacos.length === 0 && (
        <EmptyState
          mensagem="Você ainda não cadastrou nenhum espaço."
          linkTo="/gestao/espacos/novo"
          linkLabel="Cadastrar o primeiro espaço"
        />
      )}

      {!carregando && !erro && espacos.length > 0 && (
        <div className="flex flex-col gap-4">
          {espacos.map((espaco) => (
            <Card
              key={espaco.slug}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg font-bold text-gray-800">{espaco.nome}</p>
                  <Badge tom={espaco.disponivel ? "emerald" : "red"}>
                    {espaco.disponivel ? "Disponível" : "Indisponível"}
                  </Badge>
                </div>

                <p className="text-sm text-gray-500">
                  {espaco.tipo} · {espaco.localizacao}
                </p>

                <p className="text-sm text-gray-800">
                  R$ {Number(espaco.preco).toFixed(2)}
                  <span className="text-sm font-normal text-gray-400">
                    {" "}
                    /{espaco.unidadePreco}
                  </span>
                </p>
              </div>

              <Button
                as={Link}
                to={`/gestao/espacos/${espaco.slug}/editar`}
                variante="secundario"
                className="shrink-0"
              >
                Editar
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
