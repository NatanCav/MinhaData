import * as configService from "../services/configService.js";

export async function obterWhatsapp(_req, res, next) {
  try {
    const resultado = await configService.obterWhatsappContato();
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}
