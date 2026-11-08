import cloudinary from "../lib/cloudinary.js";
import { AppError } from "../middlewares/AppError.js";

export function enviarImagem(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "minhadata/espacos", resource_type: "image" },
      (erro, resultado) => {
        if (erro || !resultado) {
          return reject(new AppError("Não foi possível enviar a imagem.", 502));
        }
        resolve(resultado.secure_url);
      }
    );
    stream.end(buffer);
  });
}
