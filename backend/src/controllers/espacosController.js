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
