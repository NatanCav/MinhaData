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
import ImagemUpload from "../../components/ui/ImagemUpload";
import ListaEditavel from "../../components/ui/ListaEditavel";
import {
  atualizarEspaco,
  criarEspaco,
  getEspacoDoProprietarioPorSlug,
  uploadImagem,
} from "../../services/espacosService";

const REGEX_DIACRITICOS = /[̀-ͯ]/g;

function gerarIdComodidade(label) {
  return label
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(REGEX_DIACRITICOS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const FORMULARIO_INICIAL = {
  nome: "",
  tipo: "",
  localizacao: "",
  descricao: "",
  preco: "",
  unidadePreco: "dia",
  capacidade: "",
  imagemCapa: "",
  galeria: [],
  comodidades: [],
  informacoes: [],
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
          galeria: Array.isArray(espaco.galeria) ? espaco.galeria : [],
          comodidades: Array.isArray(espaco.comodidades)
            ? espaco.comodidades.map((comodidade) => comodidade.label)
            : [],
          informacoes: Array.isArray(espaco.informacoes) ? espaco.informacoes : [],
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

  function adicionarNaGaleria(url) {
    setFormulario((atual) => ({ ...atual, galeria: [...atual.galeria, url] }));
  }

  function removerDaGaleria(indice) {
    setFormulario((atual) => ({
      ...atual,
      galeria: atual.galeria.filter((_, i) => i !== indice),
    }));
  }

  function adicionarComodidade(texto) {
    setFormulario((atual) => ({ ...atual, comodidades: [...atual.comodidades, texto] }));
  }

  function removerComodidade(indice) {
    setFormulario((atual) => ({
      ...atual,
      comodidades: atual.comodidades.filter((_, i) => i !== indice),
    }));
  }

  function adicionarInformacao(texto) {
    setFormulario((atual) => ({ ...atual, informacoes: [...atual.informacoes, texto] }));
  }

  function removerInformacao(indice) {
    setFormulario((atual) => ({
      ...atual,
      informacoes: atual.informacoes.filter((_, i) => i !== indice),
    }));
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
      imagemCapa: formulario.imagemCapa || undefined,
      galeria: formulario.galeria,
      comodidades: formulario.comodidades.map((label) => ({
        id: gerarIdComodidade(label),
        label,
      })),
      informacoes: formulario.informacoes,
      disponivel: formulario.disponivel,
    };

    setEnviando(true);
    try {
      if (modoEdicao) {
        await atualizarEspaco(slug, dados);
        navigate("/gestao/espacos", {
          state: { mensagemSucesso: "Espaço atualizado com sucesso." },
        });
      } else {
        await criarEspaco(dados);
        navigate("/gestao/espacos", {
          state: { mensagemSucesso: "Espaço cadastrado com sucesso." },
        });
      }
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

        <ImagemUpload
          label="Imagem de capa"
          valor={formulario.imagemCapa}
          onEnviar={async (arquivo) => {
            const url = await uploadImagem(arquivo);
            atualizarCampo("imagemCapa", url);
          }}
        />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-700">Galeria de fotos</p>

          {formulario.galeria.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {formulario.galeria.map((url, indice) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt=""
                    className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removerDaGaleria(indice)}
                    aria-label="Remover imagem da galeria"
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-red-500 shadow-sm hover:bg-red-50"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <ImagemUpload
            onEnviar={async (arquivo) => {
              const url = await uploadImagem(arquivo);
              adicionarNaGaleria(url);
            }}
          />
        </div>

        <ListaEditavel
          label="Comodidades"
          itens={formulario.comodidades}
          onAdicionar={adicionarComodidade}
          onRemover={removerComodidade}
          placeholder="Ex.: Piscina, Churrasqueira, Garagem..."
        />

        <ListaEditavel
          label="Informações importantes"
          itens={formulario.informacoes}
          onAdicionar={adicionarInformacao}
          onRemover={removerInformacao}
          placeholder="Ex.: Horário de funcionamento: 08:00 às 22:00"
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
    </div>
  );
}
