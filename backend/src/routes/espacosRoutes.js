import { Router } from "express";
import * as espacosController from "../controllers/espacosController.js";
import { autenticar, exigirProprietario } from "../middlewares/autenticacao.js";

const router = Router();

router.get("/", espacosController.listar);
router.get("/:slug", espacosController.obterPorSlug);
router.post("/", autenticar, exigirProprietario, espacosController.criar);
router.put("/:slug", autenticar, exigirProprietario, espacosController.atualizar);
router.delete("/:slug", autenticar, exigirProprietario, espacosController.excluir);

export default router;
