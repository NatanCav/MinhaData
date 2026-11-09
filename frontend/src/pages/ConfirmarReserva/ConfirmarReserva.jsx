import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReserva } from "../../context/useReserva";
import { useAuth } from "../../context/useAuth";
import Container from "../../components/ui/Container";
import SectionTitle from "../../components/ui/SectionTitle";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import ModalReservaSucesso from "../../components/ui/ModalReservaSucesso";
import { IconeCalendario, IconeRelogio } from "../../components/ui/Icones";
import { criarReserva } from "../../services/reservasService";
import { getWhatsappContato } from "../../services/configService";

function normalizarCpf(cpf) {
  return String(cpf ?? "").replace(/\D/g, "");
}

function calcularDigitoVerificador(base) {
  let soma = 0;
  for (let i = 0; i < base.length; i++) {
    soma += Number(base[i]) * (base.length + 1 - i);
  }
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

function cpfValido(cpf) {
  const digitos = normalizarCpf(cpf);
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;

  const digito1 = calcularDigitoVerificador(digitos.slice(0, 9));
  const digito2 = calcularDigitoVerificador(digitos.slice(0, 10));

  return digito1 === Number(digitos[9]) && digito2 === Number(digitos[10]);
}

function formatarNumeroWhatsapp(numero) {
  const digitos = String(numero ?? "").replace(/\D/g, "");
  if (digitos.startsWith("55") && digitos.length >= 12) return digitos;
  return `55${digitos}`;
}

function formatarData(data) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ConfirmarReserva() {
  const { reserva, definirFormulario, limparReserva } = useReserva();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [telefone, setTelefone] = useState(usuario?.telefone ?? "");
  const [cpf, setCpf] = useState(usuario?.cpf ?? "");
  const [observacoes, setObservacoes] = useState("");
  const [erros, setErros] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState(null);
  const [reservasConfirmadas, setReservasConfirmadas] = useState(null);
  const [linkWhatsapp, setLinkWhatsapp] = useState(null);

  if (!reserva) {
    return (
      <Container as="main">
        <EmptyState
          mensagem="Nenhuma reserva em andamento. Escolha um espaço para continuar."
          linkTo="/espacos"
          linkLabel="Ver espaços"
        />
      </Container>
    );
  }

  const { espaco, datas, horario, horarioInicio, horarioFim } = reserva;

  function validar() {
    const novosErros = {};

    if (!nome.trim()) novosErros.nome = "Informe seu nome.";
    if (!telefone.trim()) novosErros.telefone = "Informe seu telefone.";
    if (!cpf.trim()) {
      novosErros.cpf = "Informe seu CPF para identificação junto ao estabelecimento.";
    } else if (!cpfValido(cpf)) {
      novosErros.cpf = "Informe um CPF válido.";
    }

    return novosErros;
  }

  async function handleConfirmar(evento) {
    evento.preventDefault();

    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setErroEnvio(null);
    setEnviando(true);
    try {
      const reservasCriadas = await criarReserva({
        espacoSlug: espaco.slug,
        datas,
        horarioInicio,
        horarioFim,
        nomeCliente: nome,
        telefoneCliente: telefone,
        cpfCliente: cpf,
        observacoes,
      });

      definirFormulario({ nome, telefone, cpf, observacoes });
      setReservasConfirmadas(reservasCriadas);
      setModalAberto(true);

      const whatsappProprietario = await getWhatsappContato();
      if (whatsappProprietario) {
        const datasFormatadas = datas.map(formatarData).join(", ");
        const mensagem =
          `Olá! Acabei de reservar o espaço *${espaco.nome}* ` +
          `para ${datas.length > 1 ? "as datas" : "o dia"} ${datasFormatadas}, ` +
          `${reservasCriadas[0].horarioInicio} às ${reservasCriadas[0].horarioFim}. ` +
          `Meu nome: ${nome}.`;
        const numero = formatarNumeroWhatsapp(whatsappProprietario);
        setLinkWhatsapp(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`);
      }
    } catch (erro) {
      setErroEnvio(erro.message || "Não foi possível concluir a reserva.");
    } finally {
      setEnviando(false);
    }
  }

  function handleFecharModal() {
    setModalAberto(false);
    setLinkWhatsapp(null);
    limparReserva();
    navigate("/");
  }

  const horarioExibido =
    espaco.unidadePreco === "hora" ? horarioInicio : `${horarioInicio} às ${horarioFim}`;

  return (
    <div className="bg-gray-50">
      <Container as="main" className="flex flex-col gap-8 py-8 lg:flex-row">
        <form
          onSubmit={handleConfirmar}
          className="flex flex-1 flex-col gap-6"
          noValidate
        >
          <SectionTitle nivel="pagina" subtitulo="Preencha seus dados para concluir a reserva.">
            Confirmar reserva
          </SectionTitle>

          <Card className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="nome" className="text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(evento) => {
                  setNome(evento.target.value);
                  setErros((atual) => ({ ...atual, nome: null }));
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              {erros.nome && <p className="text-xs text-red-500">{erros.nome}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                CPF
              </label>
              <input
                id="cpf"
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(evento) => {
                  setCpf(evento.target.value);
                  setErros((atual) => ({ ...atual, cpf: null }));
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-xs text-gray-400">
                Necessário para identificação no contato com o estabelecimento.
              </p>
              {erros.cpf && <p className="text-xs text-red-500">{erros.cpf}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(evento) => {
                  setTelefone(evento.target.value);
                  setErros((atual) => ({ ...atual, telefone: null }));
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              {erros.telefone && <p className="text-xs text-red-500">{erros.telefone}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="observacoes" className="text-sm font-medium text-gray-700">
                Observações
              </label>
              <textarea
                id="observacoes"
                rows={3}
                value={observacoes}
                onChange={(evento) => setObservacoes(evento.target.value)}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </Card>

          {erroEnvio && (
            <p className="text-sm text-red-500" role="alert">
              {erroEnvio}
            </p>
          )}

          <Button
            type="submit"
            carregando={enviando}
            disabled={enviando}
            className="w-full lg:w-auto"
          >
            Confirmar Reserva
          </Button>
        </form>

        <aside className="w-full lg:w-80">
          <Card className="flex flex-col gap-4 lg:sticky lg:top-24">
            <SectionTitle>Resumo da reserva</SectionTitle>

            <p className="text-sm font-semibold text-gray-800">{espaco.nome}</p>

            <div className="flex flex-col gap-1">
              {datas.map((data) => (
                <div key={data} className="flex items-center gap-2 text-sm text-gray-500">
                  <IconeCalendario className="h-4 w-4 shrink-0" />
                  {formatarData(data)}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <IconeRelogio className="h-4 w-4" />
              {horario || horarioExibido}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-sm text-gray-500">
                Valor{datas.length > 1 ? ` (${datas.length} datas)` : ""}
              </span>
              <p className="text-lg font-semibold text-gray-800">
                R$ {(espaco.preco * datas.length).toFixed(2)}
                {datas.length === 1 && (
                  <span className="text-sm font-normal text-gray-400">
                    {" "}
                    /{espaco.unidadePreco}
                  </span>
                )}
              </p>
            </div>
          </Card>
        </aside>
      </Container>

      {modalAberto && reservasConfirmadas && (
        <ModalReservaSucesso
          espaco={espaco}
          datas={reservasConfirmadas.map((reservaCriada) => reservaCriada.data)}
          horario={horarioExibido}
          codigoReserva={reservasConfirmadas[0].id}
          linkWhatsapp={linkWhatsapp}
          onFechar={handleFecharModal}
        />
      )}
    </div>
  );
}
