import { Router } from "express";
import { autenticar, exigirProprietario } from "../middlewares/autenticacao.js";
import { middlewareUpload, enviar } from "../controllers/uploadController.js";

const router = Router();

router.post("/", autenticar, exigirProprietario, middlewareUpload, enviar);

export default router;
