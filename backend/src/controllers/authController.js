import * as authService from "../services/authService.js";

const CAMINHO_COOKIE_REFRESH = "/api/auth";
const COOKIE_BASE = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

function definirCookiesSessao(res, { accessToken, refreshToken }) {
  res.cookie("accessToken", accessToken, { ...COOKIE_BASE, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, {
    ...COOKIE_BASE,
    path: CAMINHO_COOKIE_REFRESH,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function limparCookiesSessao(res) {
  res.clearCookie("accessToken", COOKIE_BASE);
  res.clearCookie("refreshToken", { ...COOKIE_BASE, path: CAMINHO_COOKIE_REFRESH });
}

export async function cadastrar(req, res, next) {
  try {
    const { usuario, accessToken, refreshToken } = await authService.cadastrar(req.body ?? {});
    definirCookiesSessao(res, { accessToken, refreshToken });
    res.status(201).json({ usuario });
  } catch (erro) {
    next(erro);
  }
}

export async function login(req, res, next) {
  try {
    const resultado = await authService.login(req.body ?? {});

    if (resultado.requerDoisFatores) {
      return res.json({ requerDoisFatores: true, loginToken: resultado.loginToken });
    }

    definirCookiesSessao(res, resultado);
    res.json({ requerDoisFatores: false, usuario: resultado.usuario });
  } catch (erro) {
    next(erro);
  }
}

export async function confirmarLoginDoisFatores(req, res, next) {
  try {
    const resultado = await authService.confirmarLoginDoisFatores(req.body ?? {});
    definirCookiesSessao(res, resultado);
    res.json({ usuario: resultado.usuario });
  } catch (erro) {
    next(erro);
  }
}

export async function renovar(req, res, next) {
  try {
    const resultado = await authService.renovarSessao(req.cookies?.refreshToken);
    definirCookiesSessao(res, resultado);
    res.json({ usuario: resultado.usuario });
  } catch (erro) {
    limparCookiesSessao(res);
    next(erro);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logout(req.cookies?.refreshToken);
    limparCookiesSessao(res);
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
}

export async function me(req, res, next) {
  try {
    const usuario = await authService.obterUsuarioPorId(req.usuarioId);
    res.json({ usuario });
  } catch (erro) {
    next(erro);
  }
}

export async function recuperarSenha(req, res, next) {
  try {
    const resultado = await authService.solicitarRecuperacaoSenha(req.body?.email);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function redefinirSenha(req, res, next) {
  try {
    const resultado = await authService.redefinirSenha(req.body ?? {});
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}
