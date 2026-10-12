import { Router } from "express";
import { getTransformers } from "../controllers/transformer.controller.js";

const router = Router();

// GET /api/transformers?page=1
router.get("/", getTransformers);

export default router;
