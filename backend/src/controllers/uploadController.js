import multer from "multer";
import { enviarImagem } from "../services/uploadService.js";
import { AppError } from "../middlewares/AppError.js";

const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO_BYTES },
  fileFilter(_req, file, callback) {
    if (!file.mimetype.startsWith("image/")) {
      return callback(new AppError("Envie apenas arquivos de imagem.", 400));
    }
    callback(null, true);
  },
});

export function middlewareUpload(req, res, next) {
  upload.single("imagem")(req, res, (erro) => {
    if (erro instanceof multer.MulterError) {
      const mensagem =
        erro.code === "LIMIT_FILE_SIZE"
          ? "Imagem muito grande (máximo 5MB)."
          : "Não foi possível enviar a imagem.";
      return next(new AppError(mensagem, 400));
    }
    if (erro) return next(erro);
    next();
  });
}

export async function enviar(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError("Nenhum arquivo enviado.", 400);
    }

    const url = await enviarImagem(req.file.buffer);
    res.status(201).json({ url });
  } catch (erro) {
    next(erro);
  }
}
