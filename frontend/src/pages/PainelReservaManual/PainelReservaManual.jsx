import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionTitle from "../../components/ui/SectionTitle";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Calendario from "../../components/ui/Calendario";
import { getEspacosDoProprietario } from "../../services/espacosService";
import { getDisponibilidade } from "../../services/disponibilidadeService";
import { criarReservaManual } from "../../services/reservasService";

export default function PainelReservaManual() {
  const navigate = useNavigate();

  const [espacos, setEspacos] = useState([]);
  const [espacoSlug, setEspacoSlug] = useState("");
  const [carregandoEspacos, setCarregandoEspacos] = useState(true);

  const [disponibilidade, setDisponibilidade] = useState({ datasIndisponiveis: [] });

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [datas, setDatas] = useState([]);
  const [horarioInicio, setHorarioInicio] = useState("09:00");
  const [horarioFim, setHorarioFim] = useState("20:00");
  const [observacoes, setObservacoes] = useState("");
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    getEspacosDoProprietario()
      .then((dados) => {
        setEspacos(dados);
        if (dados.length > 0) setEspacoSlug(dados[0].slug);
      })
      .catch(() => setErroEnvio("Não foi possível carregar os espaços."))
      .finally(() => setCarregandoEspacos(false));
  }, []);

  useEffect(() => {
    if (!espacoSlug) return;
    getDisponibilidade(espacoSlug)
      .then((dados) => setDisponibilidade(dados))
      .catch(() => setDisponibilidade({ datasIndisponiveis: [] }));
  }, [espacoSlug]);

  function alternarData(novaData) {
    setDatas((atual) =>
      atual.includes(novaData)
        ? atual.filter((item) => item !== novaData)
        : [...atual, novaData].sort()
    );
    setErros((atual) => ({ ...atual, datas: null }));
  }

  function validar() {
    const novosErros = {};
    if (!espacoSlug) novosErros.espaco = "Selecione um espaço.";
    if (datas.length === 0) novosErros.datas = "Selecione ao menos uma data.";
    if (!nome.trim()) novosErros.nome = "Informe o nome do cliente.";
    if (!telefone.trim()) novosErros.telefone = "Informe o telefone do cliente.";
    if (!horarioInicio || !horarioFim || horarioFim <= horarioInicio) {
      novosErros.horario = "Informe um intervalo de horário válido.";
    }
    return novosErros;
  }

  async function handleSalvar(evento) {
    evento.preventDefault();
    setErroEnvio(null);

    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setEnviando(true);
    try {
      await criarReservaManual({
        espacoSlug,
        datas,
        horarioInicio,
        horarioFim,
        nomeCliente: nome,
        telefoneCliente: telefone,
        cpfCliente: cpf || undefined,
        observacoes,
      });
      navigate("/gestao/reservas", {
        state: { mensagemSucesso: "Reserva cadastrada com sucesso." },
      });
    } catch (erro) {
      setErroEnvio(erro.message || "Não foi possível cadastrar a reserva.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionTitle
        nivel="pagina"
        subtitulo="Para reservas combinadas fora do site (Instagram, WhatsApp, telefone). Entra direto como confirmada."
      >
        Cadastrar reserva manual
      </SectionTitle>

      <Card as="form" onSubmit={handleSalvar} className="flex max-w-2xl flex-col gap-4" noValidate>
        {!carregandoEspacos && espacos.length > 1 && (
          <Select
            id="espaco"
            label="Espaço"
            value={espacoSlug}
            onChange={(evento) => {
              setEspacoSlug(evento.target.value);
              setDatas([]);
            }}
          >
            {espacos.map((espaco) => (
              <option key={espaco.slug} value={espaco.slug}>
                {espaco.nome}
              </option>
            ))}
          </Select>
        )}

        <Input
          id="nome"
          label="Nome do cliente"
          value={nome}
          onChange={(evento) => {
            setNome(evento.target.value);
            setErros((atual) => ({ ...atual, nome: null }));
          }}
          erro={erros.nome}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="telefone"
            label="Telefone"
            type="tel"
            value={telefone}
            onChange={(evento) => {
              setTelefone(evento.target.value);
              setErros((atual) => ({ ...atual, telefone: null }));
            }}
            erro={erros.telefone}
          />

          <Input
            id="cpf"
            label="CPF (opcional)"
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(evento) => setCpf(evento.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Data(s)</span>
          <Calendario
            datasSelecionadas={datas}
            onSelecionarData={alternarData}
            datasIndisponiveis={disponibilidade.datasIndisponiveis}
          />
          {erros.datas && <p className="text-xs text-red-500">{erros.datas}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="horarioInicio"
            label="Horário de início"
            type="time"
            value={horarioInicio}
            onChange={(evento) => {
              setHorarioInicio(evento.target.value);
              setErros((atual) => ({ ...atual, horario: null }));
            }}
          />
          <Input
            id="horarioFim"
            label="Horário de término"
            type="time"
            value={horarioFim}
            onChange={(evento) => {
              setHorarioFim(evento.target.value);
              setErros((atual) => ({ ...atual, horario: null }));
            }}
          />
        </div>
        {erros.horario && <p className="text-xs text-red-500">{erros.horario}</p>}

        <Textarea
          id="observacoes"
          label="Observações"
          value={observacoes}
          onChange={(evento) => setObservacoes(evento.target.value)}
        />

        {erroEnvio && <p className="text-sm text-red-500">{erroEnvio}</p>}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variante="secundario"
            onClick={() => navigate("/gestao/reservas")}
            disabled={enviando}
          >
            Cancelar
          </Button>
          <Button type="submit" carregando={enviando}>
            Cadastrar reserva
          </Button>
        </div>
      </Card>
    </div>
  );
}
