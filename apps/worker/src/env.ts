import { getOptionalEnv, getRequiredEnv } from "@fomo/shared";

export type WorkerEnv = {
  birdeyeApiKey: string;
  birdeyeBaseUrl: string;
  birdeyeChain: string;
  birdeyeRps: number;
  trendingLimit: number;
  workerSecret: string | null;
};

export function readEnv(): WorkerEnv {
  return {
    birdeyeApiKey: getRequiredEnv("BIRDEYE_API_KEY"),
    birdeyeBaseUrl: getOptionalEnv(
      "BIRDEYE_BASE_URL",
      "https://public-api.birdeye.so"
    ),
    birdeyeChain: getOptionalEnv("BIRDEYE_CHAIN", "solana"),
    birdeyeRps: Number(getOptionalEnv("BIRDEYE_RPS", "8")),
    trendingLimit: Number(getOptionalEnv("FOMO_TRENDING_LIMIT", "25")),
    workerSecret: process.env.WORKER_SECRET ?? null
  };
}

/**
 * Reads env without throwing — used by `--demo` mode where we run the
 * pipeline against fixtures and never hit Birdeye.
 */
export function readEnvOptional(): Partial<WorkerEnv> {
  const apiKey = process.env.BIRDEYE_API_KEY;
  return {
    birdeyeApiKey: apiKey,
    birdeyeBaseUrl: getOptionalEnv(
      "BIRDEYE_BASE_URL",
      "https://public-api.birdeye.so"
    ),
    birdeyeChain: getOptionalEnv("BIRDEYE_CHAIN", "solana"),
    birdeyeRps: Number(getOptionalEnv("BIRDEYE_RPS", "8")),
    trendingLimit: Number(getOptionalEnv("FOMO_TRENDING_LIMIT", "25")),
    workerSecret: process.env.WORKER_SECRET ?? null
  };
}
