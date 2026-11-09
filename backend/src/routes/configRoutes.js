import { Router } from "express";
import * as configController from "../controllers/configController.js";

const router = Router();

router.get("/whatsapp-contato", configController.obterWhatsapp);

export default router;
