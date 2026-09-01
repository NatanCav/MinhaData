import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { autenticar } from "../middlewares/autenticacao.js";

const router = Router();

router.post("/cadastro", authController.cadastrar);
router.post("/login", authController.login);
router.post("/login/2fa", authController.confirmarLoginDoisFatores);
router.post("/refresh", authController.renovar);
router.post("/logout", authController.logout);
router.post("/recuperar-senha", authController.recuperarSenha);
router.post("/redefinir-senha", authController.redefinirSenha);
router.get("/me", autenticar, authController.me);

export default router;
