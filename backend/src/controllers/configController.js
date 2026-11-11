import * as configService from "../services/configService.js";

export async function obterContatosWhatsapp(_req, res, next) {
  try {
    const resultado = await configService.obterContatosWhatsapp();
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}
