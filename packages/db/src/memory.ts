import type { AlertRecord, EnrichedSnapshot, TrapScoreResult } from "@fomo/shared";
import type { FomoDb, StoredScoreRow, TokenRow } from "./types";

/**
 * In-memory `FomoDb` implementation. Designed for hackathon demos and unit
 * tests: zero external dependencies, deterministic ordering, fast.
 *
 * The Supabase implementation can ship later with the same surface.
 */
export function createMemoryDb(): FomoDb {
  const tokens = new Map<string, TokenRow>();
  const snapshots = new Map<string, EnrichedSnapshot[]>(); // by address
  const scores = new Map<string, StoredScoreRow[]>();      // by address, newest first
  const alerts = new Map<string, AlertRecord>();           // by dedupe_key
  const watchByChat = new Map<string, Set<string>>();      // chatId → addresses
  const watchByToken = new Map<string, Set<string>>();     // address → chatIds
  const runs: { id: string; startedAt: string; finishedAt: string | null }[] = [];

  let runSeq = 0;
  let alertSeq = 0;

  const ensureToken = (address: string, symbol: string, name: string) => {
    const now = new Date().toISOString();
    const existing = tokens.get(address);
    if (existing) {
      tokens.set(address, {
        ...existing,
        symbol: symbol || existing.symbol,
        name: name || existing.name,
        lastSeenAt: now
      });
    } else {
      tokens.set(address, {
        address,
        symbol,
        name,
        firstSeenAt: now,
        lastSeenAt: now
      });
    }
  };

  return {
    async upsertToken({ address, symbol, name }) {
      ensureToken(address, symbol, name);
    },

    async getToken(address) {
      return tokens.get(address) ?? null;
    },

    async insertTokenSnapshot(snapshot) {
      ensureToken(snapshot.address, snapshot.symbol, snapshot.name);
      const arr = snapshots.get(snapshot.address) ?? [];
      arr.unshift(snapshot);
      snapshots.set(snapshot.address, arr);
    },

    async getLatestSnapshot(address) {
      return snapshots.get(address)?.[0] ?? null;
    },

    async insertScore({ tokenAddress, scoredAt, result, analystSummary }) {
      const token = tokens.get(tokenAddress);
      const latestSnap = snapshots.get(tokenAddress)?.[0];
      if (!token || !latestSnap) {
        throw new Error(
          `insertScore: no token/snapshot for ${tokenAddress}. Insert a snapshot first.`
        );
      }
      const row: StoredScoreRow = {
        tokenAddress,
        symbol: token.symbol,
        name: token.name,
        scoredAt,
        trapScore: result.trapScore,
        verdict: result.verdict,
        reasons: result.reasons,
        warnings: result.warnings,
        analystSummary,
        snapshot: latestSnap
      };
      const arr = scores.get(tokenAddress) ?? [];
      arr.unshift(row);
      scores.set(tokenAddress, arr);
      return row;
    },

    async getLatestScore(address) {
      return scores.get(address)?.[0] ?? null;
    },

    async listTopTrapScores(limit) {
      return latestPerToken(scores)
        .sort((a, b) => b.trapScore - a.trapScore || b.scoredAt.localeCompare(a.scoredAt))
        .slice(0, limit);
    },

    async listCleanPumps(limit) {
      return latestPerToken(scores)
        .filter((s) => s.verdict === "Clean Pump")
        .sort((a, b) => b.scoredAt.localeCompare(a.scoredAt))
        .slice(0, limit);
    },

    async listBySignal(code, limit) {
      return latestPerToken(scores)
        .filter((s) => s.reasons.some((r) => r.code === code))
        .sort((a, b) => b.trapScore - a.trapScore)
        .slice(0, limit);
    },

    async insertAlertIfNew(alert) {
      if (alerts.has(alert.dedupeKey)) return { inserted: false };
      alertSeq += 1;
      const id = alert.id || `alrt_${String(alertSeq).padStart(4, "0")}`;
      alerts.set(alert.dedupeKey, { ...alert, id });
      return { inserted: true };
    },

    async listRecentAlerts(limit) {
      return Array.from(alerts.values())
        .sort((a, b) => b.firedAt.localeCompare(a.firedAt))
        .slice(0, limit);
    },

    async markAlertDelivered(id) {
      for (const [k, v] of alerts.entries()) {
        if (v.id === id) alerts.set(k, { ...v, deliveredTelegram: true });
      }
    },

    async addWatch(chatId, address) {
      const tokenSet = watchByChat.get(chatId) ?? new Set();
      tokenSet.add(address);
      watchByChat.set(chatId, tokenSet);

      const chatSet = watchByToken.get(address) ?? new Set();
      chatSet.add(chatId);
      watchByToken.set(address, chatSet);
    },

    async removeWatch(chatId, address) {
      watchByChat.get(chatId)?.delete(address);
      watchByToken.get(address)?.delete(chatId);
    },

    async listSubscribersFor(address) {
      return Array.from(watchByToken.get(address) ?? []);
    },

    async listWatches(chatId) {
      return Array.from(watchByChat.get(chatId) ?? []);
    },

    async startRun() {
      runSeq += 1;
      const id = `run_${String(runSeq).padStart(4, "0")}`;
      runs.unshift({ id, startedAt: new Date().toISOString(), finishedAt: null });
      return id;
    },

    async finishRun(runId, summary) {
      const run = runs.find((r) => r.id === runId);
      if (run) run.finishedAt = new Date().toISOString();
      // summary is intentionally not persisted in-memory beyond completion ts;
      // the Supabase impl will store the full breakdown.
      void summary;
    }
  };
}

function latestPerToken(scores: Map<string, unknown[]>): StoredScoreRow[] {
  const out: StoredScoreRow[] = [];
  for (const arr of scores.values()) {
    const latest = arr[0] as StoredScoreRow | undefined;
    if (latest) out.push(latest);
  }
  return out;
}
