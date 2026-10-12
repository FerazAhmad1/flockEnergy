import type { Request, Response } from "express";
import { transformerService } from "../services/index.js";

export const getTransformers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 1);

    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: "page must be a positive integer",
      });
    }

    const result = await transformerService.getTransformers(page);

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
