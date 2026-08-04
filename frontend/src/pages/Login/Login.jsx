import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const localizacao = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function validar() {
    const novosErros = {};

    if (!email.trim()) {
      novosErros.email = "Informe seu e-mail.";
    } else if (!REGEX_EMAIL.test(email.trim())) {
      novosErros.email = "Informe um e-mail válido.";
    }
    if (!senha) novosErros.senha = "Informe sua senha.";

    return novosErros;
  }

  async function handleEntrar(evento) {
    evento.preventDefault();
    setErroEnvio(null);

    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setEnviando(true);
    try {
      await entrar({ email, senha });
      const destino = localizacao.state?.from ?? "/";
      navigate(destino, { replace: true });
    } catch (erro) {
      setErroEnvio(erro.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout titulo="Entrar" subtitulo="Acesse sua conta para gerenciar suas reservas.">
      <form onSubmit={handleEntrar} className="flex flex-col gap-4" noValidate>
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

        <div className="flex justify-end">
          <Link
            to="/esqueci-minha-senha"
            className="rounded text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            Esqueci minha senha
          </Link>
        </div>

        {erroEnvio && <p className="text-sm text-red-500">{erroEnvio}</p>}

        <Button type="submit" carregando={enviando} className="w-full">
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Ainda não tem uma conta?{" "}
        <Link
          to="/cadastro"
          className="rounded font-medium text-emerald-700 transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          Cadastre-se
        </Link>
      </p>
    </AuthLayout>
  );
}
