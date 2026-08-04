import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReserva } from "../../context/useReserva";
import Container from "../../components/ui/Container";
import SectionTitle from "../../components/ui/SectionTitle";
import Button from "../../components/ui/Button";
import ModalReservaSucesso from "../../components/ui/ModalReservaSucesso";
import { IconeCalendario, IconeRelogio } from "../../components/ui/Icones";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [erros, setErros] = useState({});
  const [modalAberto, setModalAberto] = useState(false);

  if (!reserva) {
    return (
      <Container as="main" className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-gray-400">
          Nenhuma reserva em andamento. Escolha um espaço para continuar.
        </p>
        <Link
          to="/espacos"
          className="text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800"
        >
          Ver espaços
        </Link>
      </Container>
    );
  }

  const { espaco, data, horario } = reserva;

  function validar() {
    const novosErros = {};

    if (!nome.trim()) novosErros.nome = "Informe seu nome.";
    if (!telefone.trim()) novosErros.telefone = "Informe seu telefone.";
    if (!email.trim()) {
      novosErros.email = "Informe seu e-mail.";
    } else if (!REGEX_EMAIL.test(email.trim())) {
      novosErros.email = "Informe um e-mail válido.";
    }

    return novosErros;
  }

  function handleConfirmar(evento) {
    evento.preventDefault();

    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    definirFormulario({ nome, telefone, email, observacoes });
    setModalAberto(true);
  }

  function handleFecharModal() {
    setModalAberto(false);
    limparReserva();
    navigate("/");
  }

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

          <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-md">
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
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(evento) => {
                  setEmail(evento.target.value);
                  setErros((atual) => ({ ...atual, email: null }));
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              {erros.email && <p className="text-xs text-red-500">{erros.email}</p>}
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
          </div>

          <Button type="submit" className="w-full lg:w-auto">
            Confirmar Reserva
          </Button>
        </form>

        <aside className="w-full lg:w-80">
          <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-md lg:sticky lg:top-24">
            <SectionTitle>Resumo da reserva</SectionTitle>

            <p className="text-sm font-semibold text-gray-800">{espaco.nome}</p>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <IconeCalendario className="h-4 w-4" />
              {formatarData(data)}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <IconeRelogio className="h-4 w-4" />
              {horario}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-sm text-gray-500">Valor</span>
              <p className="text-lg font-semibold text-gray-800">
                R$ {espaco.preco.toFixed(2)}
                <span className="text-sm font-normal text-gray-400">
                  {" "}
                  /{espaco.unidadePreco}
                </span>
              </p>
            </div>
          </div>
        </aside>
      </Container>

      {modalAberto && (
        <ModalReservaSucesso
          espaco={espaco}
          data={data}
          horario={horario}
          onFechar={handleFecharModal}
        />
      )}
    </div>
  );
}
