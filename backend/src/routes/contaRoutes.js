import { Router } from "express";
import * as contaController from "../controllers/contaController.js";
import { autenticar } from "../middlewares/autenticacao.js";

const router = Router();

router.use(autenticar);

router.patch("/senha", contaController.alterarSenha);
router.post("/2fa/iniciar", contaController.iniciarDoisFatores);
router.post("/2fa/confirmar", contaController.confirmarDoisFatores);
router.post("/2fa/desativar", contaController.desativarDoisFatores);
router.post("/telefone/solicitar-verificacao", contaController.solicitarVerificacaoTelefone);
router.post("/telefone/confirmar", contaController.confirmarVerificacaoTelefone);
router.patch("/whatsapp", contaController.atualizarContatosWhatsapp);

export default router;
