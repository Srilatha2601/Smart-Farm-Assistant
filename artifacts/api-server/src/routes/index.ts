import { Router, type IRouter } from "express";
import healthRouter from "./health";
import diseaseRouter from "./disease";
import droneRouter from "./drones";
import storageRouter from "./storage";
import marketRouter from "./market";
import geminiRouter from "./gemini";

const router: IRouter = Router();

router.use(healthRouter);
router.use(diseaseRouter);
router.use(droneRouter);
router.use(storageRouter);
router.use(marketRouter);
router.use(geminiRouter);

export default router;
