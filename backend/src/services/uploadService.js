import cloudinary from "../lib/cloudinary.js";
import { AppError } from "../middlewares/AppError.js";

// resource_type "auto": o Cloudinary detecta se o arquivo é imagem ou
// vídeo e aplica o processamento correto para cada caso.
export function enviarArquivo(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "minhadata/espacos", resource_type: "auto" },
      (erro, resultado) => {
        if (erro || !resultado) {
          return reject(new AppError("Não foi possível enviar o arquivo.", 502));
        }
        resolve({
          url: resultado.secure_url,
          tipo: resultado.resource_type === "video" ? "video" : "imagem",
        });
      }
    );
    stream.end(buffer);
  });
}
