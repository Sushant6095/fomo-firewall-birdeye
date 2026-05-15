import { strict as assert } from "node:assert";
import { TokenBucketRateLimiter } from "../rate-limit";

export async function runRateLimitTests(): Promise<void> {
  const limiter = new TokenBucketRateLimiter({ ratePerSecond: 10, burst: 2 });

  const start = Date.now();
  // First 2 should be immediate (burst capacity).
  await limiter.take();
  await limiter.take();
  const immediateMs = Date.now() - start;
  assert.ok(
    immediateMs < 50,
    `burst should be immediate, got ${immediateMs}ms`
  );

  // 3rd should wait at least ~100ms (10 rps → 100ms per token).
  const beforeThird = Date.now();
  await limiter.take();
  const waited = Date.now() - beforeThird;
  assert.ok(
    waited >= 80,
    `expected limiter to wait ≥ 80ms for 3rd take, waited ${waited}ms`
  );
}
