import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TAMANHO_MINIMO_SENHA = 8;
const REGEX_SENHA_FORTE = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export default function Cadastro() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [tipoConta, setTipoConta] = useState("PF");
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function validar() {
    const novosErros = {};

    if (!nome.trim()) novosErros.nome = "Informe seu nome.";
    if (!email.trim()) {
      novosErros.email = "Informe seu e-mail.";
    } else if (!REGEX_EMAIL.test(email.trim())) {
      novosErros.email = "Informe um e-mail válido.";
    }
    if (!senha) {
      novosErros.senha = "Informe uma senha.";
    } else if (senha.length < TAMANHO_MINIMO_SENHA || !REGEX_SENHA_FORTE.test(senha)) {
      novosErros.senha = `A senha deve ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres, incluindo letras e números.`;
    }
    if (confirmarSenha !== senha) {
      novosErros.confirmarSenha = "As senhas não coincidem.";
    }

    return novosErros;
  }

  async function handleCadastrar(evento) {
    evento.preventDefault();
    setErroEnvio(null);

    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setEnviando(true);
    try {
      await cadastrar({ nome, email, senha, tipoConta });
      navigate(tipoConta === "PJ" ? "/configuracoes" : "/", { replace: true });
    } catch (erro) {
      setErroEnvio(erro.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout titulo="Criar conta" subtitulo="Cadastre-se para começar a reservar espaços.">
      <form onSubmit={handleCadastrar} className="flex flex-col gap-4" noValidate>
        <Input
          id="nome"
          label="Nome"
          type="text"
          value={nome}
          onChange={(evento) => {
            setNome(evento.target.value);
            setErros((atual) => ({ ...atual, nome: null }));
          }}
          erro={erros.nome}
        />

        <Input
          id="email"
          label="E-mail"
          type="email"
          value={email}
          onChange={(evento) => {
            setEmail(evento.target.value);
            setErros((atual) => ({ ...atual, email: null }));
          }}
          erro={erros.email}
        />

        <PasswordInput
          id="senha"
          label="Senha"
          value={senha}
          onChange={(evento) => {
            setSenha(evento.target.value);
            setErros((atual) => ({ ...atual, senha: null }));
          }}
          erro={erros.senha}
        />

        <PasswordInput
          id="confirmarSenha"
          label="Confirmar senha"
          value={confirmarSenha}
          onChange={(evento) => {
            setConfirmarSenha(evento.target.value);
            setErros((atual) => ({ ...atual, confirmarSenha: null }));
          }}
          erro={erros.confirmarSenha}
        />

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Tipo de conta</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipoConta("PF")}
              aria-pressed={tipoConta === "PF"}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                tipoConta === "PF"
                  ? "border-emerald-600 bg-emerald-100 text-emerald-700"
                  : "border-gray-200 text-gray-600 hover:border-emerald-600 hover:text-emerald-600"
              }`}
            >
              Pessoa física
            </button>
            <button
              type="button"
              onClick={() => setTipoConta("PJ")}
              aria-pressed={tipoConta === "PJ"}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                tipoConta === "PJ"
                  ? "border-emerald-600 bg-emerald-100 text-emerald-700"
                  : "border-gray-200 text-gray-600 hover:border-emerald-600 hover:text-emerald-600"
              }`}
            >
              Pessoa jurídica
            </button>
          </div>
          {tipoConta === "PJ" && (
            <p className="text-xs text-gray-500">
              Contas de pessoa jurídica precisam ativar a autenticação de dois fatores logo após o
              cadastro para poder reservar espaços.
            </p>
          )}
        </div>

        {erroEnvio && <p className="text-sm text-red-500">{erroEnvio}</p>}

        <Button type="submit" carregando={enviando} className="w-full">
          Criar conta
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Já tem uma conta?{" "}
        <Link
          to="/login"
          className="rounded font-medium text-emerald-700 transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
