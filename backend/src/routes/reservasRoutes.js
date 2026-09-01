import { Router } from "express";
import * as reservasController from "../controllers/reservasController.js";
import { autenticar } from "../middlewares/autenticacao.js";

const router = Router();

router.post("/", autenticar, reservasController.criar);
router.get("/:id", reservasController.obterPorId);

export default router;
