import { useState } from "react";
import { Link } from "react-router-dom";
import { recuperarSenha } from "../../services/authService";
import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EsqueciMinhaSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

  async function handleEnviar(evento) {
    evento.preventDefault();
    setErro(null);

    if (!email.trim()) {
      setErro("Informe seu e-mail.");
      return;
    }
    if (!REGEX_EMAIL.test(email.trim())) {
      setErro("Informe um e-mail válido.");
      return;
    }

    setEnviando(true);
    try {
      const resposta = await recuperarSenha(email);
      setMensagemSucesso(resposta.mensagem);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      titulo="Recuperar senha"
      subtitulo="Informe seu e-mail para receber instruções de redefinição."
    >
      {mensagemSucesso ? (
        <p className="text-center text-sm text-emerald-700">{mensagemSucesso}</p>
      ) : (
        <form onSubmit={handleEnviar} className="flex flex-col gap-4" noValidate>
          <Input
            id="email"
            label="E-mail"
            type="email"
            value={email}
            onChange={(evento) => {
              setEmail(evento.target.value);
              setErro(null);
            }}
            erro={erro}
          />

          <Button type="submit" carregando={enviando} className="w-full">
            Enviar instruções
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-gray-500">
        Lembrou sua senha?{" "}
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
