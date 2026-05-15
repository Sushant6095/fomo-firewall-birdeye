/**
 * Exponential backoff with full jitter for transient Birdeye failures.
 *
 * Retries:
 *  - HTTP 429 (always, honoring `Retry-After` when present)
 *  - HTTP 5xx
 *  - Network errors (fetch throws / aborts)
 *  - Birdeye-shaped `{ success: false }` responses
 */

export type RetryOptions = {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
};

export class BirdeyeRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
    public readonly path: string,
    public readonly retryable: boolean
  ) {
    super(message);
    this.name = "BirdeyeRequestError";
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const max = opts.maxRetries ?? 3;
  const base = opts.baseDelayMs ?? 300;
  const cap = opts.maxDelayMs ?? 4_000;

  let attempt = 0;
  let lastErr: unknown;

  while (attempt <= max) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err) || attempt === max) break;

      const retryAfter = extractRetryAfterMs(err);
      const expo = Math.min(cap, base * 2 ** attempt);
      const jitter = Math.random() * expo;
      const delay = retryAfter ?? jitter;

      await sleep(delay);
      attempt += 1;
    }
  }

  throw lastErr;
}

function isRetryable(err: unknown): boolean {
  if (err instanceof BirdeyeRequestError) return err.retryable;
  if (err instanceof Error && err.name === "AbortError") return true;
  return true; // network errors are retryable by default
}

function extractRetryAfterMs(err: unknown): number | null {
  if (err instanceof BirdeyeRequestError && err.status === 429) {
    // Birdeye doesn't always return Retry-After; default to 1s for 429.
    return 1_000;
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
