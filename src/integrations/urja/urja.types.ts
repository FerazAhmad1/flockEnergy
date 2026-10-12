export interface MeterHierarchyLevel {
  name: string | null;
  code: string | null;
}

export interface MeterHierarchy {
  zone: MeterHierarchyLevel;
  circle: MeterHierarchyLevel;
  division: MeterHierarchyLevel;
  subdivision: MeterHierarchyLevel;
  substation: MeterHierarchyLevel;
  feeder: MeterHierarchyLevel;
  dt: MeterHierarchyLevel;
}

export interface Meter {
  meterId: string;
  serialNo: string;
  make: string;
  phaseType: string;
  installStatus: string;
  installType: string;
  build: string;
  dtCode: string;
  hierarchy: MeterHierarchy;
  geo: {
    lat: number;
    lng: number;
  };
}

export interface MeterSearchResult {
  data: Meter[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EnergyReading {
  timestamp: string;
  kwh: string;
  kvah: string;
  voltR: string;
}

export interface EnergyResponse {
  data: EnergyReading[];
}

export interface MeterGeo {
  latitude: number;
  longitude: number;
}

export interface MeterGeoResponse {
  data: {
    latitude: string;
    longitude: string;
  };
}

export interface Transformer {
  [key: string]: unknown;
}

export interface TransformerSearchResult {
  data: Transformer[];
  total: number;
  page: number;
  pageSize: number;
}
