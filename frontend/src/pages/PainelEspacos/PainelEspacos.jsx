import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SectionTitle from "../../components/ui/SectionTitle";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import Toast from "../../components/ui/Toast";
import { useToast } from "../../hooks/useToast";
import { excluirEspaco, getEspacosDoProprietario } from "../../services/espacosService";

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
  const [excluindoSlug, setExcluindoSlug] = useState(null);

  const { toast, mostrarToast, fecharToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    getEspacosDoProprietario()
      .then((dados) => setEspacos(dados))
      .catch(() => setErro("Não foi possível carregar os espaços."))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    if (!location.state?.mensagemSucesso) return;
    mostrarToast(location.state.mensagemSucesso, "sucesso");
    navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- so deve rodar quando a tela e navegada com um state novo
  }, [location.state]);

  async function handleExcluir(espaco) {
    const confirmado = window.confirm(
      `Tem certeza que deseja excluir "${espaco.nome}"? Esta ação não pode ser desfeita.`
    );
    if (!confirmado) return;

    setExcluindoSlug(espaco.slug);
    try {
      await excluirEspaco(espaco.slug);
      setEspacos((atual) => atual.filter((item) => item.slug !== espaco.slug));
      mostrarToast("Espaço excluído com sucesso.", "sucesso");
    } catch (erroExclusao) {
      mostrarToast(erroExclusao.message || "Não foi possível excluir o espaço.", "erro");
    } finally {
      setExcluindoSlug(null);
    }
  }

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

              <div className="flex shrink-0 gap-2">
                <Button
                  as={Link}
                  to={`/gestao/espacos/${espaco.slug}/editar`}
                  variante="secundario"
                >
                  Editar
                </Button>
                <Button
                  variante="secundario"
                  className="text-red-500 hover:text-red-600"
                  disabled={excluindoSlug === espaco.slug}
                  carregando={excluindoSlug === espaco.slug}
                  onClick={() => handleExcluir(espaco)}
                >
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
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
