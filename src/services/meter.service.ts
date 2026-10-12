import type { PortalClient } from "../integrations/urja/portal-client.interface.js";

export class MeterService {
  constructor(private readonly portal: PortalClient) {}

  async searchMeters(query: string, page: number) {
    return this.portal.searchMeters(query, page);
  }

  async getMeterById(meterId: string) {
    return this.portal.getMeterById(meterId);
  }
}
