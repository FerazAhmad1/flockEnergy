import express from "express";
import type { Request, Response, NextFunction } from "express";
import meterRouter from "./routes/meter.route.js";
import energyRouter from "./routes/energy.route.js";
import transformerRouter from "./routes/transformer.route.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/meters", meterRouter);
app.use("/api", energyRouter);
app.use("/api/transformers", transformerRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// malformed JSON body / malformed URL etc. arrive here with a 4xx status
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status ?? err.statusCode;

  if (status >= 400 && status < 500) {
    return res.status(status).json({ success: false, message: "Bad request" });
  }

  console.error(err);
  return res
    .status(500)
    .json({ success: false, message: "Internal server error" });
});

export default app;
