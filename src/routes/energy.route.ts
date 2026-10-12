import { Router } from "express";
import { getEnergy, getGeo } from "../controllers/energy.controller.js";

const router = Router();

// GET /api/meters/:meterId/energy
router.get("/meters/:meterId/energy", getEnergy);

// GET /api/meters/:meterId/geo
router.get("/meters/:meterId/geo", getGeo);

export default router;
