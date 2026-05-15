/**
 * Token-bucket rate limiter. Birdeye's public API limits vary by plan; this
 * defaults to a conservative 8 rps so the worker stays under the line even
 * under bursts. Callers `await limiter.take()` before issuing a request.
 */

export type RateLimiterOptions = {
  /** Sustained requests per second. */
  ratePerSecond: number;
  /** Max instantaneous burst (defaults to ratePerSecond). */
  burst?: number;
};

export class TokenBucketRateLimiter {
  private readonly ratePerSecond: number;
  private readonly capacity: number;
  private tokens: number;
  private lastRefillMs: number;
  private queue: Array<() => void> = [];

  constructor(opts: RateLimiterOptions) {
    if (opts.ratePerSecond <= 0) {
      throw new Error("ratePerSecond must be > 0");
    }
    this.ratePerSecond = opts.ratePerSecond;
    this.capacity = Math.max(1, opts.burst ?? opts.ratePerSecond);
    this.tokens = this.capacity;
    this.lastRefillMs = Date.now();
  }

  async take(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Queue the caller until we can refill enough.
    await new Promise<void>((resolve) => {
      this.queue.push(resolve);
      this.scheduleDrain();
    });
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefillMs) / 1000;
    if (elapsed <= 0) return;
    const refill = elapsed * this.ratePerSecond;
    this.tokens = Math.min(this.capacity, this.tokens + refill);
    this.lastRefillMs = now;
  }

  private scheduleDrain(): void {
    if (this.queue.length === 0) return;
    const msPerToken = 1000 / this.ratePerSecond;
    setTimeout(() => this.drain(), Math.max(1, msPerToken));
  }

  private drain(): void {
    this.refill();
    while (this.tokens >= 1 && this.queue.length > 0) {
      this.tokens -= 1;
      const next = this.queue.shift();
      next?.();
    }
    if (this.queue.length > 0) this.scheduleDrain();
  }
}
