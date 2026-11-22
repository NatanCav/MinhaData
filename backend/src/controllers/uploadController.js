import multer from "multer";
import { enviarArquivo } from "../services/uploadService.js";
import { AppError } from "../middlewares/AppError.js";

const TAMANHO_MAXIMO_BYTES = 50 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO_BYTES },
  fileFilter(_req, file, callback) {
    if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
      return callback(new AppError("Envie apenas arquivos de imagem ou vídeo.", 400));
    }
    callback(null, true);
  },
});

export function middlewareUpload(req, res, next) {
  upload.single("imagem")(req, res, (erro) => {
    if (erro instanceof multer.MulterError) {
      const mensagem =
        erro.code === "LIMIT_FILE_SIZE"
          ? "Arquivo muito grande (máximo 50MB)."
          : "Não foi possível enviar o arquivo.";
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

    const resultado = await enviarArquivo(req.file.buffer);
    res.status(201).json(resultado);
  } catch (erro) {
    next(erro);
  }
}
