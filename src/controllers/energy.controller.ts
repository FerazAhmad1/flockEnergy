import type { Request, Response } from "express";
import { energyService, meterService } from "../services/index.js";

export const getEnergy = async (
  req: Request<{ meterId: string }>,
  res: Response,
) => {
  try {
    const { meterId } = req.params;

    const meter = await meterService.getMeterById(meterId);

    if (!meter) {
      return res.status(404).json({
        success: false,
        message: "Meter not found",
      });
    }

    const readings = await energyService.getEnergy(meterId);

    return res.status(200).json({ success: true, data: readings });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getGeo = async (
  req: Request<{ meterId: string }>,
  res: Response,
) => {
  try {
    const { meterId } = req.params;

    const meter = await meterService.getMeterById(meterId);

    if (!meter) {
      return res.status(404).json({
        success: false,
        message: "Meter not found",
      });
    }

    const geo = await energyService.getGeo(meterId);

    return res.status(200).json({ success: true, data: geo });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
