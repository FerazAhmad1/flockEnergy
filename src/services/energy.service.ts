import type { PortalClient } from "../integrations/urja/portal-client.interface.js";

export class EnergyService {
  constructor(private readonly portal: PortalClient) {}

  async getEnergy(meterId: string) {
    return this.portal.getEnergy(meterId);
  }

  async getGeo(meterId: string) {
    return this.portal.getGeo(meterId);
  }
}
