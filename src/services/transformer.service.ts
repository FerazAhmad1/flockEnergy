import type { PortalClient } from "../integrations/urja/portal-client.interface.js";

export class TransformerService {
  constructor(private readonly portal: PortalClient) {}

  async getTransformers(page: number) {
    return this.portal.getTransformers(page);
  }
}
