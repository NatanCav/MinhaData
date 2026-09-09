import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SectionTitle from "../../components/ui/SectionTitle";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import Toast from "../../components/ui/Toast";
import { useToast } from "../../hooks/useToast";
import {
  atualizarEspaco,
  criarEspaco,
  getEspacoDoProprietarioPorSlug,
} from "../../services/espacosService";

const FORMULARIO_INICIAL = {
  nome: "",
  tipo: "",
  localizacao: "",
  descricao: "",
  preco: "",
  unidadePreco: "dia",
  capacidade: "",
  imagemCapa: "",
  disponivel: true,
};

export default function PainelEspacoForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const modoEdicao = Boolean(slug);

  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [carregando, setCarregando] = useState(modoEdicao);
  const [erroCarregamento, setErroCarregamento] = useState(null);

  const { toast, mostrarToast, fecharToast } = useToast();

  useEffect(() => {
    if (!modoEdicao) return;

    getEspacoDoProprietarioPorSlug(slug)
      .then((espaco) => {
        setFormulario({
          nome: espaco.nome,
          tipo: espaco.tipo,
          localizacao: espaco.localizacao,
          descricao: espaco.descricao,
          preco: String(espaco.preco),
          unidadePreco: espaco.unidadePreco,
          capacidade: String(espaco.capacidade),
          imagemCapa: espaco.imagemCapa || "",
          disponivel: espaco.disponivel,
        });
      })
      .catch(() => setErroCarregamento("Não foi possível carregar este espaço."))
      .finally(() => setCarregando(false));
  }, [slug, modoEdicao]);

  function atualizarCampo(campo, valor) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: null }));
  }

  function validar() {
    const novosErros = {};

    if (!formulario.nome.trim()) novosErros.nome = "Informe o nome do espaço.";
    if (!formulario.tipo.trim()) novosErros.tipo = "Informe o tipo do espaço.";
    if (!formulario.localizacao.trim())
      novosErros.localizacao = "Informe a localização.";
    if (!formulario.descricao.trim())
      novosErros.descricao = "Descreva o espaço para os clientes.";

    const preco = Number(formulario.preco);
    if (!formulario.preco || Number.isNaN(preco) || preco <= 0) {
      novosErros.preco = "Informe um preço válido.";
    }

    const capacidade = Number(formulario.capacidade);
    if (!formulario.capacidade || Number.isNaN(capacidade) || capacidade <= 0) {
      novosErros.capacidade = "Informe uma capacidade válida.";
    }

    return novosErros;
  }

  async function handleSalvar(evento) {
    evento.preventDefault();
    setErroEnvio(null);

    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    const dados = {
      nome: formulario.nome.trim(),
      tipo: formulario.tipo.trim(),
      localizacao: formulario.localizacao.trim(),
      descricao: formulario.descricao.trim(),
      preco: Number(formulario.preco),
      unidadePreco: formulario.unidadePreco,
      capacidade: Number(formulario.capacidade),
      imagemCapa: formulario.imagemCapa.trim() || undefined,
      disponivel: formulario.disponivel,
    };

    setEnviando(true);
    try {
      if (modoEdicao) {
        await atualizarEspaco(slug, dados);
        mostrarToast("Espaço atualizado com sucesso.", "sucesso");
      } else {
        await criarEspaco(dados);
        mostrarToast("Espaço cadastrado com sucesso.", "sucesso");
      }
      navigate("/gestao/espacos");
    } catch (erro) {
      setErroEnvio(
        erro.message ||
          (modoEdicao
            ? "Não foi possível atualizar o espaço."
            : "Não foi possível cadastrar o espaço.")
      );
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-8 w-64" />
        <Card className="flex flex-col gap-4">
          {Array.from({ length: 5 }, (_, indice) => (
            <Skeleton key={indice} className="h-10 w-full" />
          ))}
        </Card>
      </div>
    );
  }

  if (erroCarregamento) {
    return <EmptyState mensagem={erroCarregamento} tom="erro" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionTitle
        nivel="pagina"
        subtitulo={
          modoEdicao
            ? "Atualize as informações deste espaço."
            : "Preencha as informações para publicar um novo espaço."
        }
      >
        {modoEdicao ? "Editar espaço" : "Cadastrar espaço"}
      </SectionTitle>

      <Card as="form" onSubmit={handleSalvar} className="flex max-w-2xl flex-col gap-4" noValidate>
        <Input
          id="nome"
          label="Nome do espaço"
          value={formulario.nome}
          onChange={(evento) => atualizarCampo("nome", evento.target.value)}
          erro={erros.nome}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="tipo"
            label="Tipo"
            placeholder="Chácara, Salão de Festas, Quiosque..."
            value={formulario.tipo}
            onChange={(evento) => atualizarCampo("tipo", evento.target.value)}
            erro={erros.tipo}
          />

          <Input
            id="localizacao"
            label="Localização"
            value={formulario.localizacao}
            onChange={(evento) => atualizarCampo("localizacao", evento.target.value)}
            erro={erros.localizacao}
          />
        </div>

        <Textarea
          id="descricao"
          label="Descrição"
          value={formulario.descricao}
          onChange={(evento) => atualizarCampo("descricao", evento.target.value)}
          erro={erros.descricao}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            id="preco"
            label="Preço (R$)"
            type="number"
            min="0"
            step="0.01"
            value={formulario.preco}
            onChange={(evento) => atualizarCampo("preco", evento.target.value)}
            erro={erros.preco}
          />

          <Select
            id="unidadePreco"
            label="Cobrança por"
            value={formulario.unidadePreco}
            onChange={(evento) => atualizarCampo("unidadePreco", evento.target.value)}
          >
            <option value="dia">Dia</option>
            <option value="hora">Hora</option>
          </Select>

          <Input
            id="capacidade"
            label="Capacidade (pessoas)"
            type="number"
            min="0"
            value={formulario.capacidade}
            onChange={(evento) => atualizarCampo("capacidade", evento.target.value)}
            erro={erros.capacidade}
          />
        </div>

        <Input
          id="imagemCapa"
          label="URL da imagem de capa"
          placeholder="https://..."
          value={formulario.imagemCapa}
          onChange={(evento) => atualizarCampo("imagemCapa", evento.target.value)}
        />

        <Select
          id="disponivel"
          label="Disponibilidade"
          value={formulario.disponivel ? "sim" : "nao"}
          onChange={(evento) => atualizarCampo("disponivel", evento.target.value === "sim")}
        >
          <option value="sim">Disponível para reservas</option>
          <option value="nao">Indisponível</option>
        </Select>

        {erroEnvio && <p className="text-sm text-red-500">{erroEnvio}</p>}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variante="secundario"
            onClick={() => navigate("/gestao/espacos")}
            disabled={enviando}
          >
            Cancelar
          </Button>
          <Button type="submit" carregando={enviando}>
            {modoEdicao ? "Salvar alterações" : "Cadastrar espaço"}
          </Button>
        </div>
      </Card>

      <Toast
        mensagem={toast.mensagem}
        tom={toast.tom}
        visivel={toast.visivel}
        onFechar={fecharToast}
      />
    </div>
  );
}
