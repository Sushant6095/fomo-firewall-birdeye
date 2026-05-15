import { enrichToken, type BirdeyeClient } from "@fomo/birdeye";
import type { EnrichedSnapshot } from "@fomo/shared";
import { log } from "../log";

const PARALLEL = 5;

export type EnrichOutcome =
  | { kind: "ok"; snapshot: EnrichedSnapshot; warnings: string[] }
  | { kind: "error"; address: string; error: string };

/**
 * Step 2 of the ingestion pipeline.
 *
 * Enriches each address with the full Birdeye sweep (overview + txs + holder
 * profile + holder positions + top holders + security). Per-token failures
 * are isolated — one bad token cannot crash the whole run.
 */
export async function enrichBatch(
  client: BirdeyeClient,
  addresses: string[]
): Promise<EnrichOutcome[]> {
  const queue = [...addresses];
  const out: EnrichOutcome[] = [];
  const workers: Promise<void>[] = [];

  for (let i = 0; i < Math.min(PARALLEL, queue.length); i += 1) {
    workers.push(worker(client, queue, out));
  }
  await Promise.all(workers);
  log.info("enrich batch complete", {
    requested: addresses.length,
    ok: out.filter((o) => o.kind === "ok").length,
    errors: out.filter((o) => o.kind === "error").length
  });
  return out;
}

async function worker(
  client: BirdeyeClient,
  queue: string[],
  out: EnrichOutcome[]
): Promise<void> {
  while (queue.length > 0) {
    const address = queue.shift();
    if (!address) return;
    try {
      const { snapshot, warnings } = await enrichToken(client, address);
      out.push({ kind: "ok", snapshot, warnings });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.warn("enrich token failed", { address, error: message });
      out.push({ kind: "error", address, error: message });
    }
  }
}
