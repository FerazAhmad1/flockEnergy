import { Router } from "express";
import { searchMeters, getMeterById } from "../controllers/meter.controller.js";

const router = Router();

// GET /api/meters?q=J100012&page=1
router.get("/", searchMeters);

// GET /api/meters/:meterId
router.get("/:meterId", getMeterById);

export default router;
