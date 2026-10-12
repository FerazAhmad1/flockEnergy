import type { PortalClient } from "./portal-client.interface.js";
import { config } from "../../config.js";

import type {
  EnergyReading,
  Meter,
  MeterGeo,
  MeterSearchResult,
  TransformerSearchResult,
} from "./urja.types.js";

const BASE_URL = config.urjaBaseUrl;
const USERNAME = config.urjaUsername;
const PASSWORD = config.urjaPassword;

const SESSION_COOKIE_NAME = "__Secure-better-auth.session_token";
const DEFAULT_SESSION_LIFETIME_MS = 60 * 60 * 1000;

export class UrjaPortalService implements PortalClient {
  private sessionCookie = "";
  private sessionExpiresAt = 0;
  private loginPromise: Promise<void> | null = null;

  constructor() {
    if (!BASE_URL || !USERNAME || !PASSWORD) {
      throw new Error("Missing URJA_BASE_URL, URJA_USERNAME, or URJA_PASSWORD");
    }
  }

  private get baseUrl(): string {
    return BASE_URL || "";
  }

  /**
   * Log in and retain the session cookie in memory.
   */
  private async login(): Promise<void> {
    try {
      console.info("[Urja] Logging in to portal");

      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: this.baseUrl,
          Referer: `${this.baseUrl}/login`,
          "x-sveltekit-action": "true",
        },
        body: new URLSearchParams({
          email: config.urjaUsername,
          password: config.urjaPassword,
        }),
        redirect: "manual",
      });

      const responseBody = await response.text();

      console.log("[Urja] Login status:", response.status);
      console.log("[Urja] Login response:", responseBody);

      console.log(response);
      const setCookies = response.headers.getSetCookie();

      const sessionCookie = setCookies.find((cookie) =>
        cookie.startsWith(`${SESSION_COOKIE_NAME}=`),
      );

      if (!response.ok || !sessionCookie) {
        console.error(`[Urja] Login failed with status ${response.status}`);
        throw new Error(`Urja login failed with status ${response.status}`);
      }

      const cookiePair = sessionCookie.split(";")[0];
      const separatorIndex = cookiePair.indexOf("=");

      if (separatorIndex < 0) {
        throw new Error("Urja login returned an invalid session cookie");
      }

      this.sessionCookie = cookiePair;
      this.sessionExpiresAt = Date.now() + DEFAULT_SESSION_LIFETIME_MS;

      const maxAgeMatch = sessionCookie.match(/;\s*Max-Age=(\d+)/i);

      if (maxAgeMatch) {
        this.sessionExpiresAt = Date.now() + Number(maxAgeMatch[1]) * 1000;
      }

      console.info("[Urja] Login successful");
    } catch (error) {
      throw error;
    }
  }

  /**
   * Ensure only one login happens when multiple requests arrive together.
   */
  private async ensureAuthenticated(): Promise<void> {
    if (this.sessionCookie && Date.now() < this.sessionExpiresAt - 30_000) {
      return;
    }

    if (!this.loginPromise) {
      this.loginPromise = this.login().finally(() => {
        this.loginPromise = null;
      });
    }

    await this.loginPromise;
  }

  /**
   * Make an authenticated request and retry once after an auth failure.
   */
  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    for (let attempt = 0; attempt < 2; attempt++) {
      await this.ensureAuthenticated();

      const headers = new Headers(options.headers);
      headers.set("Cookie", this.sessionCookie);
      headers.set("Accept", "application/json");

      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
        signal: options.signal ?? AbortSignal.timeout(15_000),
      });

      if (
        (response.status === 401 || response.status === 403) &&
        attempt === 0
      ) {
        this.sessionCookie = "";
        this.sessionExpiresAt = 0;
        continue;
      }

      if (!response.ok) {
        throw new Error(
          `Urja request failed: ${response.status} ${response.statusText}`,
        );
      }

      return (await response.json()) as T;
    }

    throw new Error("Urja authentication failed after retry");
  }

  async searchMeters(query: string, page: number): Promise<MeterSearchResult> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: String(page),
      });

      return this.request<MeterSearchResult>(
        `/portal/meters/search?${params.toString()}`,
      );
    } catch (error) {
      throw error;
    }
  }

  async getMeterById(meterId: string): Promise<Meter | null> {
    try {
      const result = await this.searchMeters(meterId, 1);

      return result.data.find((meter) => meter.meterId === meterId) ?? null;
    } catch (error) {
      throw error;
    }
  }

  async getEnergy(meterId: string): Promise<EnergyReading[]> {
    try {
      const result = await this.request<{ data: EnergyReading[] }>(
        `/portal/meters/${encodeURIComponent(meterId)}/energy`,
      );

      return result.data;
    } catch (error) {
      throw error;
    }
  }

  async getGeo(meterId: string): Promise<MeterGeo> {
    try {
      const result = await this.request<{
        data: {
          latitude: string;
          longitude: string;
        };
      }>(`/portal/meters/${encodeURIComponent(meterId)}/geo`);

      return {
        latitude: Number(result.data.latitude),
        longitude: Number(result.data.longitude),
      };
    } catch (error) {
      throw error;
    }
  }

  async getTransformers(page: number): Promise<TransformerSearchResult> {
    try {
      return this.request<TransformerSearchResult>(`/portal/dts?page=${page}`);
    } catch (error) {
      throw error;
    }
  }
}
