import { Router } from "express";
import * as reservasController from "../controllers/reservasController.js";

const router = Router();

router.post("/", reservasController.criar);
router.get("/:id", reservasController.obterPorId);

export default router;
