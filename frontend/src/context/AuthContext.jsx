import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext.js";
import * as authService from "../services/authService";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [loginPendente, setLoginPendente] = useState(null);

  useEffect(() => {
    let ativo = true;

    authService.obterSessao().then((sessao) => {
      if (!ativo) return;
      setUsuario(sessao);
      setCarregandoSessao(false);
    });

    return () => {
      ativo = false;
    };
  }, []);

  async function entrar({ email, senha }) {
    const resultado = await authService.login({ email, senha });

    if (resultado.requerDoisFatores) {
      setLoginPendente({ loginToken: resultado.loginToken });
      return { requerDoisFatores: true };
    }

    setUsuario(resultado.usuario);
    return { requerDoisFatores: false };
  }

  async function confirmarDoisFatoresLogin(codigo) {
    if (!loginPendente) {
      throw new Error("Nenhum login em andamento.");
    }

    const usuarioLogado = await authService.confirmarLoginDoisFatores({
      loginToken: loginPendente.loginToken,
      codigo,
    });

    setUsuario(usuarioLogado);
    setLoginPendente(null);
    return usuarioLogado;
  }

  async function cadastrar({ nome, email, senha, tipoConta }) {
    const usuarioCriado = await authService.cadastrar({ nome, email, senha, tipoConta });
    setUsuario(usuarioCriado);
    return usuarioCriado;
  }

  async function sair() {
    await authService.logout();
    setUsuario(null);
  }

  function atualizarUsuario(dados) {
    setUsuario((atual) => (atual ? { ...atual, ...dados } : atual));
  }

  const valor = useMemo(
    () => ({
      usuario,
      autenticado: Boolean(usuario),
      carregandoSessao,
      loginPendente: Boolean(loginPendente),
      entrar,
      confirmarDoisFatoresLogin,
      cadastrar,
      sair,
      atualizarUsuario,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- confirmarDoisFatoresLogin fecha sobre loginPendente, já listado abaixo
    [usuario, carregandoSessao, loginPendente]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
