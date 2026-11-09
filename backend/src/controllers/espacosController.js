import * as espacosService from "../services/espacosService.js";

export async function listar(_req, res, next) {
  try {
    const espacos = await espacosService.listarEspacos();
    res.json(espacos);
  } catch (erro) {
    next(erro);
  }
}

export async function obterPorSlug(req, res, next) {
  try {
    const espaco = await espacosService.buscarEspacoPorSlug(req.params.slug);
    res.json(espaco);
  } catch (erro) {
    next(erro);
  }
}

export async function criar(req, res, next) {
  try {
    const espaco = await espacosService.criarEspaco(req.body ?? {});
    res.status(201).json(espaco);
  } catch (erro) {
    next(erro);
  }
}

export async function atualizar(req, res, next) {
  try {
    const espaco = await espacosService.atualizarEspaco(req.params.slug, req.body ?? {});
    res.json(espaco);
  } catch (erro) {
    next(erro);
  }
}

export async function excluir(req, res, next) {
  try {
    await espacosService.excluirEspaco(req.params.slug);
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
}

export async function obterDisponibilidade(req, res, next) {
  try {
    const disponibilidade = await espacosService.obterDisponibilidade(req.params.slug);
    res.json(disponibilidade);
  } catch (erro) {
    next(erro);
  }
}
