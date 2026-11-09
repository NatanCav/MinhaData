import * as contaService from "../services/contaService.js";

export async function alterarSenha(req, res, next) {
  try {
    const resultado = await contaService.alterarSenha(req.usuarioId, req.body ?? {});
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function iniciarDoisFatores(req, res, next) {
  try {
    const resultado = await contaService.iniciarDoisFatores(req.usuarioId);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function confirmarDoisFatores(req, res, next) {
  try {
    const resultado = await contaService.confirmarDoisFatores(req.usuarioId, req.body?.codigo);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function desativarDoisFatores(req, res, next) {
  try {
    const resultado = await contaService.desativarDoisFatores(req.usuarioId, req.body ?? {});
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function solicitarVerificacaoTelefone(req, res, next) {
  try {
    const resultado = await contaService.solicitarVerificacaoTelefone(
      req.usuarioId,
      req.body?.telefone
    );
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function confirmarVerificacaoTelefone(req, res, next) {
  try {
    const resultado = await contaService.confirmarVerificacaoTelefone(
      req.usuarioId,
      req.body?.codigo
    );
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function atualizarWhatsapp(req, res, next) {
  try {
    const resultado = await contaService.atualizarWhatsappContato(req.usuarioId, req.body?.whatsapp);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}
