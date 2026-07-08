import { Router, type IRouter } from "express";
import healthRouter from "./health";
import resumesRouter from "./resumes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(resumesRouter);

export default router;
