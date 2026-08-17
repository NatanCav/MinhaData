import { Router } from "express";
import espacosRoutes from "./espacosRoutes.js";
import reservasRoutes from "./reservasRoutes.js";

const router = Router();

router.use("/espacos", espacosRoutes);
router.use("/reservas", reservasRoutes);

export default router;
