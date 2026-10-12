import type {
  EnergyReading,
  Meter,
  MeterGeo,
  MeterSearchResult,
  TransformerSearchResult,
} from "./urja.types.js";

export interface PortalClient {
  searchMeters(query: string, page: number): Promise<MeterSearchResult>;

  getMeterById(meterId: string): Promise<Meter | null>;

  getEnergy(meterId: string): Promise<EnergyReading[]>;

  getGeo(meterId: string): Promise<MeterGeo>;

  getTransformers(page: number): Promise<TransformerSearchResult>;
}
