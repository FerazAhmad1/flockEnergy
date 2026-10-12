import type { Request, Response } from "express";
import { meterService } from "../services/index.js";

export const searchMeters = async (req: Request, res: Response) => {
  try {
    const { q = "" } = req.query;
    const page = Number(req.query.page ?? 1);

    if (typeof q !== "string") {
      return res.status(400).json({
        success: false,
        message: "q must be a string",
      });
    }

    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: "page must be a positive integer",
      });
    }

    const result = await meterService.searchMeters(q, page);

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getMeterById = async (
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

    return res.status(200).json({ success: true, data: meter });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
