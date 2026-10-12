import { UrjaPortalService } from "../integrations/urja/urja-portal.service.js";

import { MeterService } from "./meter.service.js";
import { EnergyService } from "./energy.service.js";
import { TransformerService } from "./transformer.service.js";

const urjaPortalService = new UrjaPortalService();

export const meterService = new MeterService(urjaPortalService);
export const energyService = new EnergyService(urjaPortalService);
export const transformerService = new TransformerService(urjaPortalService);
