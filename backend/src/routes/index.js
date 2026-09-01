import { Router } from "express";
import espacosRoutes from "./espacosRoutes.js";
import reservasRoutes from "./reservasRoutes.js";
import authRoutes from "./authRoutes.js";
import contaRoutes from "./contaRoutes.js";

const router = Router();

router.use("/espacos", espacosRoutes);
router.use("/reservas", reservasRoutes);
router.use("/auth", authRoutes);
router.use("/conta", contaRoutes);

export default router;
