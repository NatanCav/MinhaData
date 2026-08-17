import { Router } from "express";
import * as espacosController from "../controllers/espacosController.js";

const router = Router();

router.get("/", espacosController.listar);
router.get("/:slug", espacosController.obterPorSlug);

export default router;
