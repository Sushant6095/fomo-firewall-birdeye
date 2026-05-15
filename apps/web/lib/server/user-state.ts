import "server-only";

/**
 * In-memory user state used by the demo. Real product would persist this
 * per-user in the DB. For the hackathon demo, a single shared bag of state
 * is fine — it survives server hot-reloads via globalThis.
 */
type AlertPrefs = {
  trapScoreThreshold: number;
  dedupMinutes: number;
  quietHours: boolean;
  signalFilters: string[];
};

type UserState = {
  watchlist: Set<string>;
  blocked: Set<string>;
  prefs: AlertPrefs;
};

const GLOBAL_KEY = "__fomo_user_state__";

function readState(): UserState {
  const g = globalThis as unknown as Record<string, UserState | undefined>;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = {
      watchlist: new Set<string>([
        // seed one watched token so the page isn't empty on first load
        "DoGxJTRP7nKpRrjEYRr7nT9hZqEqL8mTjYR4hM7N2ZpL"
      ]),
      blocked: new Set<string>(),
      prefs: {
        trapScoreThreshold: 75,
        dedupMinutes: 30,
        quietHours: false,
        signalFilters: [
          "SMART_MONEY_DIVERGENCE",
          "INSIDER_EXIT_PRESSURE",
          "LIQUIDITY_FRAGILITY"
        ]
      }
    };
  }
  return g[GLOBAL_KEY]!;
}

export function getWatchlist(): string[] {
  return Array.from(readState().watchlist);
}

export function addWatch(address: string): { added: boolean } {
  const state = readState();
  if (state.watchlist.has(address)) return { added: false };
  state.watchlist.add(address);
  return { added: true };
}

export function removeWatch(address: string): { removed: boolean } {
  const state = readState();
  if (!state.watchlist.has(address)) return { removed: false };
  state.watchlist.delete(address);
  return { removed: true };
}

export function isWatched(address: string): boolean {
  return readState().watchlist.has(address);
}

export function getBlocked(): string[] {
  return Array.from(readState().blocked);
}

export function toggleBlock(address: string): { blocked: boolean } {
  const state = readState();
  if (state.blocked.has(address)) {
    state.blocked.delete(address);
    return { blocked: false };
  }
  state.blocked.add(address);
  return { blocked: true };
}

export function isBlocked(address: string): boolean {
  return readState().blocked.has(address);
}

export function getAlertPrefs(): AlertPrefs {
  return { ...readState().prefs };
}

export function updateAlertPrefs(patch: Partial<AlertPrefs>): AlertPrefs {
  const state = readState();
  state.prefs = { ...state.prefs, ...patch };
  return { ...state.prefs };
}

export type { AlertPrefs };
