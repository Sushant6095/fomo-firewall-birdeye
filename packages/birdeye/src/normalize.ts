import type {
  HolderPositionsRaw,
  HolderProfileRaw,
  TokenOverviewRaw,
  TokenSecurityRaw,
  TokenTxRaw,
  TopHoldersRaw,
  TrendingTokenRaw
} from "./types";

/**
 * Pure functions that turn permissive Birdeye payloads into strict, internal
 * shapes. These are the *only* place where untyped `unknown` becomes
 * domain-typed data — every other consumer downstream gets clean numbers.
 *
 * Rules:
 *  - Missing numeric fields → 0, not undefined, so scoring math never NaNs.
 *  - Missing boolean fields → false.
 *  - Unknown fields are dropped silently.
 */

const num = (v: unknown, fallback = 0): number => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.length > 0) {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const str = (v: unknown, fallback = ""): string => {
  return typeof v === "string" ? v : fallback;
};

const bool = (v: unknown): boolean => v === true;

export type NormalizedTrendingToken = {
  address: string;
  symbol: string;
  name: string;
  rank: number | null;
};

export function normalizeTrending(
  items: TrendingTokenRaw[] | undefined
): NormalizedTrendingToken[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((i): i is TrendingTokenRaw => typeof i?.address === "string")
    .map((i) => ({
      address: i.address,
      symbol: str(i.symbol, "TOKEN"),
      name: str(i.name, i.symbol ?? "Unknown"),
      rank: typeof i.rank === "number" ? i.rank : null
    }));
}

export type NormalizedOverview = {
  address: string;
  symbol: string;
  name: string;
  priceUsd: number;
  liquidityUsd: number;
  volume1hUsd: number;
  buyVolume1hUsd: number;
  sellVolume1hUsd: number;
  priceChange1h: number;
  liquidityChange1h: number;
  marketCapUsd: number | null;
  fdvUsd: number | null;
};

export function normalizeOverview(
  raw: TokenOverviewRaw | undefined,
  address: string
): NormalizedOverview {
  if (!raw) {
    return zeroedOverview(address);
  }
  return {
    address: str(raw.address, address),
    symbol: str(raw.symbol, "TOKEN"),
    name: str(raw.name, str(raw.symbol, "Unknown")),
    priceUsd: num(raw.price),
    liquidityUsd: num(raw.liquidity),
    volume1hUsd: num(raw.v1hUSD),
    buyVolume1hUsd: num(raw.vBuy1hUSD),
    sellVolume1hUsd: num(raw.vSell1hUSD),
    priceChange1h: num(raw.priceChange1hPercent),
    liquidityChange1h: num(raw.liquidityChange1hPercent),
    marketCapUsd: typeof raw.mc === "number" ? raw.mc : null,
    fdvUsd: typeof raw.fdv === "number" ? raw.fdv : null
  };
}

function zeroedOverview(address: string): NormalizedOverview {
  return {
    address,
    symbol: "TOKEN",
    name: "Unknown",
    priceUsd: 0,
    liquidityUsd: 0,
    volume1hUsd: 0,
    buyVolume1hUsd: 0,
    sellVolume1hUsd: 0,
    priceChange1h: 0,
    liquidityChange1h: 0,
    marketCapUsd: null,
    fdvUsd: null
  };
}

export type NormalizedTxs = {
  buyVolumeUsd: number;
  sellVolumeUsd: number;
  smartWalletBuyUsd: number;
  smartWalletSellUsd: number;
  insiderBuyUsd: number;
  insiderSellUsd: number;
  largeBuyCount: number;
  largeSellCount: number;
};

const LARGE_TRADE_USD = 5_000;

export function normalizeTxs(
  items: TokenTxRaw[] | undefined,
  windowStartMs: number,
  windowEndMs: number
): NormalizedTxs {
  const out: NormalizedTxs = {
    buyVolumeUsd: 0,
    sellVolumeUsd: 0,
    smartWalletBuyUsd: 0,
    smartWalletSellUsd: 0,
    insiderBuyUsd: 0,
    insiderSellUsd: 0,
    largeBuyCount: 0,
    largeSellCount: 0
  };
  if (!Array.isArray(items)) return out;

  for (const tx of items) {
    const t = num(tx.blockUnixTime) * 1000;
    if (t < windowStartMs || t > windowEndMs) continue;

    const usd = num(tx.volumeInUSD);
    if (usd <= 0) continue;
    const isBuy = tx.side === "buy";
    const isSmart = bool(tx.isSmartMoney) || tx.walletTag === "smart_money";
    const isInsider =
      bool(tx.isInsider) || bool(tx.isDev) || tx.walletTag === "insider";

    if (isBuy) {
      out.buyVolumeUsd += usd;
      if (isSmart) out.smartWalletBuyUsd += usd;
      if (isInsider) out.insiderBuyUsd += usd;
      if (usd >= LARGE_TRADE_USD) out.largeBuyCount += 1;
    } else {
      out.sellVolumeUsd += usd;
      if (isSmart) out.smartWalletSellUsd += usd;
      if (isInsider) out.insiderSellUsd += usd;
      if (usd >= LARGE_TRADE_USD) out.largeSellCount += 1;
    }
  }
  return out;
}

export type NormalizedHolderProfile = {
  smartWalletNetflowUsd: number;
  insiderNetflowUsd: number;
};

export function normalizeHolderProfile(
  raw: HolderProfileRaw | undefined
): NormalizedHolderProfile {
  return {
    smartWalletNetflowUsd: num(raw?.smartMoneyNetflow1hUSD),
    insiderNetflowUsd: num(raw?.insiderNetflow1hUSD)
  };
}

export type NormalizedHolderPositions = {
  insiderWalletCount: number;
  devWalletCount: number;
  insiderUsdExposure: number;
};

export function normalizeHolderPositions(
  raw: HolderPositionsRaw | undefined
): NormalizedHolderPositions {
  const insiders = Array.isArray(raw?.insiders) ? raw!.insiders : [];
  const devs = Array.isArray(raw?.devs) ? raw!.devs : [];
  const insiderUsdExposure = insiders.reduce(
    (sum, w) => sum + num(w.usdValue),
    0
  );
  return {
    insiderWalletCount: insiders.length,
    devWalletCount: devs.length,
    insiderUsdExposure
  };
}

export type NormalizedTopHolders = {
  top10HolderPercent: number;
  top20HolderPercent: number;
  topHolderPercent: number;
};

export function normalizeTopHolders(
  raw: TopHoldersRaw | undefined
): NormalizedTopHolders {
  const items = Array.isArray(raw?.items) ? raw!.items : [];
  const sortedDesc = [...items].sort(
    (a, b) => num(b.percentage) - num(a.percentage)
  );
  const sumOfTop = (n: number) =>
    sortedDesc.slice(0, n).reduce((s, w) => s + num(w.percentage), 0);
  return {
    top10HolderPercent: num(raw?.topTen, sumOfTop(10)),
    top20HolderPercent: num(raw?.topTwenty, sumOfTop(20)),
    topHolderPercent: sortedDesc[0] ? num(sortedDesc[0].percentage) : 0
  };
}

export type NormalizedSecurity = {
  hasMutableMetadata: boolean;
  hasFreezeAuthority: boolean;
  hasMintAuthority: boolean;
  transferFeeBps: number;
  notes: string[];
};

export function normalizeSecurity(
  raw: TokenSecurityRaw | undefined
): NormalizedSecurity {
  const notes: string[] = [];
  const hasMutableMetadata = raw?.isMutable === true;
  const hasFreezeAuthority =
    typeof raw?.freezeAuthority === "string" && raw.freezeAuthority.length > 0;
  const hasMintAuthority =
    typeof raw?.mintAuthority === "string" && raw.mintAuthority.length > 0;
  const transferFeeBps = num(raw?.transferFeeBps);

  if (hasMutableMetadata) notes.push("Mutable metadata is still enabled.");
  if (hasFreezeAuthority) notes.push("Freeze authority is set — transfers can be frozen.");
  if (hasMintAuthority) notes.push("Mint authority is still active — supply can expand.");
  if (transferFeeBps > 100)
    notes.push(`Transfer fee is ${(transferFeeBps / 100).toFixed(2)}% per transfer.`);
  if (raw?.fakeToken === true) notes.push("Token flagged as a possible fake.");

  return {
    hasMutableMetadata,
    hasFreezeAuthority,
    hasMintAuthority,
    transferFeeBps,
    notes
  };
}
