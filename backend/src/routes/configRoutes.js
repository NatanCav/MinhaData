import { Router } from "express";
import * as configController from "../controllers/configController.js";

const router = Router();

router.get("/contatos-whatsapp", configController.obterContatosWhatsapp);

export default router;
