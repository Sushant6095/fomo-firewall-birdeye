/**
 * Deterministic time helpers used for alert dedupe and snapshot windowing.
 *
 * Dedupe is by *bucket*: two alerts for the same token+verdict that fire
 * within the same 15-minute bucket collapse to a single alert row.
 */

export const DEDUPE_BUCKET_MS = 15 * 60 * 1000; // 15 minutes

export function bucketTimestamp(
  ms: number = Date.now(),
  bucketMs: number = DEDUPE_BUCKET_MS
): number {
  return Math.floor(ms / bucketMs) * bucketMs;
}

export function isoBucket(
  ms: number = Date.now(),
  bucketMs: number = DEDUPE_BUCKET_MS
): string {
  return new Date(bucketTimestamp(ms, bucketMs)).toISOString();
}

export function minutesAgo(ms: number, now: number = Date.now()): number {
  return Math.max(0, Math.round((now - ms) / 60_000));
}

export function isoNow(): string {
  return new Date().toISOString();
}
