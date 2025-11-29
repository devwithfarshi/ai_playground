import { Router } from "express";
import { generateController } from "./controller";

const router = Router();

router.post("/generate", generateController);

export default router;
