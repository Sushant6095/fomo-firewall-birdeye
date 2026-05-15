import {
  BirdeyeRequestError,
  withRetry,
  type RetryOptions
} from "./retry";
import { TokenBucketRateLimiter } from "./rate-limit";
import type {
  BirdeyeEnvelope,
  HolderPositionsRaw,
  HolderProfileRaw,
  NewListingRaw,
  TokenOverviewRaw,
  TokenSecurityRaw,
  TokenTxRaw,
  TopHoldersRaw,
  TrendingTokenRaw
} from "./types";

export type BirdeyeClientOptions = {
  apiKey: string;
  baseUrl?: string;
  chain?: "solana" | string;
  timeoutMs?: number;
  rateLimit?: {
    ratePerSecond?: number;
    burst?: number;
  };
  retry?: RetryOptions;
  fetch?: typeof fetch;
};

export type Logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => void;
  warn: (msg: string, meta?: Record<string, unknown>) => void;
  error: (msg: string, meta?: Record<string, unknown>) => void;
};

const NOOP_LOGGER: Logger = {
  debug: () => undefined,
  warn: () => undefined,
  error: () => undefined
};

export class BirdeyeClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly chain: string;
  private readonly timeoutMs: number;
  private readonly limiter: TokenBucketRateLimiter;
  private readonly retry: RetryOptions;
  private readonly fetchImpl: typeof fetch;
  private readonly log: Logger;

  constructor(options: BirdeyeClientOptions, logger: Logger = NOOP_LOGGER) {
    if (!options.apiKey) throw new Error("Missing Birdeye API key");
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? "https://public-api.birdeye.so";
    this.chain = options.chain ?? "solana";
    this.timeoutMs = options.timeoutMs ?? 12_000;
    this.limiter = new TokenBucketRateLimiter({
      ratePerSecond: options.rateLimit?.ratePerSecond ?? 8,
      burst: options.rateLimit?.burst
    });
    this.retry = options.retry ?? { maxRetries: 3, baseDelayMs: 300 };
    this.fetchImpl = options.fetch ?? fetch;
    this.log = logger;
  }

  // ─── Public endpoints ──────────────────────────────────────────────────

  getTrendingTokens(params: { limit?: number; interval?: string } = {}) {
    return this.get<BirdeyeEnvelope<{ tokens: TrendingTokenRaw[] }>>(
      "/defi/token_trending",
      {
        sort_by: "rank",
        sort_type: "asc",
        interval: params.interval ?? "1h",
        limit: params.limit ?? 20
      }
    );
  }

  getTokenOverview(address: string) {
    return this.get<BirdeyeEnvelope<TokenOverviewRaw>>("/defi/token_overview", {
      address,
      frames: "1h,4h,24h"
    });
  }

  getTokenTxs(
    address: string,
    params: { limit?: number; beforeTime?: number; afterTime?: number } = {}
  ) {
    return this.get<BirdeyeEnvelope<{ items: TokenTxRaw[] }>>(
      "/defi/v3/token/txs",
      {
        address,
        limit: params.limit ?? 50,
        before_time: params.beforeTime,
        after_time: params.afterTime
      }
    );
  }

  getHolderProfile(address: string) {
    // Birdeye uses `token_address` for /token/v1/* endpoints (not `address`).
    return this.get<BirdeyeEnvelope<HolderProfileRaw>>(
      "/token/v1/holder-profile",
      { token_address: address }
    );
  }

  getHolderPositions(address: string) {
    return this.get<BirdeyeEnvelope<HolderPositionsRaw>>(
      "/token/v1/holder-positions",
      { token_address: address }
    );
  }

  getTopHolders(address: string) {
    return this.get<BirdeyeEnvelope<TopHoldersRaw>>("/defi/v3/token/holder", {
      address
    });
  }

  getTokenSecurity(address: string) {
    return this.get<BirdeyeEnvelope<TokenSecurityRaw>>("/defi/token_security", {
      address
    });
  }

  getNewListings(
    params: { limit?: number; memePlatformEnabled?: boolean } = {}
  ) {
    return this.get<BirdeyeEnvelope<{ items: NewListingRaw[] }>>(
      "/defi/v2/tokens/new_listing",
      {
        limit: params.limit ?? 20,
        meme_platform_enabled: params.memePlatformEnabled ?? true
      }
    );
  }

  // ─── Private ───────────────────────────────────────────────────────────

  private async get<T>(
    path: string,
    query: Record<string, string | number | boolean | undefined> = {}
  ): Promise<T> {
    return withRetry(() => this.doFetch<T>(path, query), this.retry);
  }

  private async doFetch<T>(
    path: string,
    query: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    await this.limiter.take();

    const url = new URL(path, this.baseUrl);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(url.toString(), {
        method: "GET",
        signal: controller.signal,
        headers: {
          "X-API-KEY": this.apiKey,
          "x-chain": this.chain,
          accept: "application/json"
        }
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        // 401/403 = permission gated (e.g. /defi/token_security on free tier)
        // 400 = bad request — not retryable
        // 429 = rate-limited, retry with backoff
        // 5xx = server error, retry
        const retryable = response.status === 429 || response.status >= 500;
        this.log.warn("birdeye non-ok", {
          path,
          status: response.status
        });
        throw new BirdeyeRequestError(
          `Birdeye request failed ${response.status}: ${body.slice(0, 300)}`,
          response.status,
          path,
          retryable
        );
      }

      const json = (await response.json()) as T & { success?: boolean };
      if (
        json &&
        typeof json === "object" &&
        "success" in json &&
        json.success === false
      ) {
        this.log.warn("birdeye envelope success=false", { path });
        throw new BirdeyeRequestError(
          `Birdeye envelope success=false for ${path}`,
          200,
          path,
          true
        );
      }
      return json;
    } finally {
      clearTimeout(timer);
    }
  }
}
