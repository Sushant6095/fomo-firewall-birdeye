import type {
  AlertRecord,
  AlertType,
  EnrichedSnapshot,
  TrapScoreResult,
  TrapVerdict
} from "@fomo/shared";

/**
 * Database surface. Same interface backs the in-memory implementation used
 * for the hackathon demo and (in the future) the Supabase implementation.
 */
export interface FomoDb {
  // Tokens
  upsertToken(input: {
    address: string;
    symbol: string;
    name: string;
  }): Promise<void>;

  getToken(address: string): Promise<TokenRow | null>;

  // Snapshots
  insertTokenSnapshot(snapshot: EnrichedSnapshot): Promise<void>;
  getLatestSnapshot(address: string): Promise<EnrichedSnapshot | null>;

  // Scores
  insertScore(input: {
    tokenAddress: string;
    scoredAt: string;
    result: TrapScoreResult;
    analystSummary: string;
  }): Promise<StoredScoreRow>;

  getLatestScore(address: string): Promise<StoredScoreRow | null>;
  /** Latest score per token, sorted by trap_score desc. */
  listTopTrapScores(limit: number): Promise<StoredScoreRow[]>;
  /** Latest score per token where verdict === "Clean Pump". */
  listCleanPumps(limit: number): Promise<StoredScoreRow[]>;
  /** Latest score per token that mentions the given signal code. */
  listBySignal(code: string, limit: number): Promise<StoredScoreRow[]>;

  // Alerts
  insertAlertIfNew(alert: AlertRecord): Promise<{ inserted: boolean }>;
  listRecentAlerts(limit: number): Promise<AlertRecord[]>;
  markAlertDelivered(id: string): Promise<void>;

  // Watchlists
  addWatch(chatId: string, address: string): Promise<void>;
  removeWatch(chatId: string, address: string): Promise<void>;
  listSubscribersFor(address: string): Promise<string[]>;

  // Ingestion runs
  startRun(): Promise<string>;
  finishRun(
    runId: string,
    summary: { tokensSeen: number; tokensScored: number; alertsFired: number; errors: unknown[] }
  ): Promise<void>;
}

export type TokenRow = {
  address: string;
  symbol: string;
  name: string;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type StoredScoreRow = {
  tokenAddress: string;
  symbol: string;
  name: string;
  scoredAt: string;
  trapScore: number;
  verdict: TrapVerdict;
  reasons: TrapScoreResult["reasons"];
  warnings: string[];
  analystSummary: string;
  /** Most recent snapshot fields used by the dashboard table. */
  snapshot: EnrichedSnapshot;
};

export type RecentAlertEvent = {
  type: AlertType;
  tokenAddress: string;
  trapScore: number;
  verdict: TrapVerdict;
  headline: string;
  message: string;
};
