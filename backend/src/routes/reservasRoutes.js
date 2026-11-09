import { Router } from "express";
import * as reservasController from "../controllers/reservasController.js";
import { autenticar, autenticarOpcional, exigirProprietario } from "../middlewares/autenticacao.js";

const router = Router();

router.get("/", autenticar, exigirProprietario, reservasController.listarTodas);
router.get("/minhas", autenticar, reservasController.listarMinhas);
router.post("/", autenticarOpcional, reservasController.criar);
router.get("/:id", autenticar, reservasController.obterPorId);
router.patch("/:id/status", autenticar, reservasController.atualizarStatus);
router.patch(
  "/:id/observacoes-proprietario",
  autenticar,
  exigirProprietario,
  reservasController.atualizarObservacoesProprietario
);

export default router;
