import { Router } from "express";
import espacosRoutes from "./espacosRoutes.js";
import reservasRoutes from "./reservasRoutes.js";
import authRoutes from "./authRoutes.js";
import contaRoutes from "./contaRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import configRoutes from "./configRoutes.js";

const router = Router();

router.use("/espacos", espacosRoutes);
router.use("/reservas", reservasRoutes);
router.use("/auth", authRoutes);
router.use("/conta", contaRoutes);
router.use("/uploads", uploadRoutes);
router.use("/config", configRoutes);

export default router;
