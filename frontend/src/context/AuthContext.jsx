import { useMemo, useState } from "react";
import { AuthContext } from "./authContext.js";
import * as authService from "../services/authService";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => authService.obterSessao());

  async function entrar({ email, senha }) {
    const sessao = await authService.login({ email, senha });
    setUsuario(sessao);
    return sessao;
  }

  async function cadastrar({ nome, email, senha }) {
    const sessao = await authService.cadastrar({ nome, email, senha });
    setUsuario(sessao);
    return sessao;
  }

  async function sair() {
    await authService.logout();
    setUsuario(null);
  }

  const valor = useMemo(
    () => ({
      usuario,
      autenticado: Boolean(usuario),
      entrar,
      cadastrar,
      sair,
    }),
    [usuario]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
