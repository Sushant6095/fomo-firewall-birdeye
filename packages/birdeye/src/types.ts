/**
 * Birdeye response types — intentionally permissive. We treat Birdeye payloads
 * as `Record<string, unknown>` at the boundary, then `normalize.ts` produces
 * the strict, internal shapes that flow into scoring and the DB.
 *
 * Every wrapper accepts the typed result so callers can `await client.getX()`
 * without casting.
 */

export type BirdeyeEnvelope<T> = {
  success: boolean;
  data?: T;
  /** Some endpoints place the payload at the top level when there is no
   *  envelope — keep things permissive. */
} & Record<string, unknown>;

export type TrendingTokenRaw = {
  address: string;
  symbol?: string;
  name?: string;
  price?: number;
  volume24hUSD?: number;
  liquidity?: number;
  rank?: number;
} & Record<string, unknown>;

export type TokenOverviewRaw = {
  address: string;
  symbol?: string;
  name?: string;
  price?: number;
  liquidity?: number;
  v1hUSD?: number;
  vBuy1hUSD?: number;
  vSell1hUSD?: number;
  priceChange1hPercent?: number;
  liquidityChange1hPercent?: number;
  mc?: number;
  fdv?: number;
} & Record<string, unknown>;

export type TokenTxRaw = {
  txHash?: string;
  side?: "buy" | "sell";
  /** USD value of the trade. */
  volumeInUSD?: number;
  owner?: string;
  blockUnixTime?: number;
  /** Birdeye tags trades with role buckets for high-tier accounts. */
  walletTag?: string;
  isSmartMoney?: boolean;
  isInsider?: boolean;
  isDev?: boolean;
} & Record<string, unknown>;

export type HolderProfileRaw = {
  address: string;
  smartMoneyNetflow1hUSD?: number;
  insiderNetflow1hUSD?: number;
  topHolderConcentration?: number;
} & Record<string, unknown>;

export type HolderPositionsRaw = {
  insiders?: Array<{ owner: string; uiAmount?: number; usdValue?: number }>;
  devs?: Array<{ owner: string; uiAmount?: number; usdValue?: number }>;
} & Record<string, unknown>;

export type TopHoldersRaw = {
  items?: Array<{ owner: string; uiAmount?: number; percentage?: number }>;
  topTen?: number;
  topTwenty?: number;
} & Record<string, unknown>;

export type TokenSecurityRaw = {
  isMutable?: boolean;
  freezeAuthority?: string | null;
  mintAuthority?: string | null;
  transferFeeBps?: number;
  fakeToken?: boolean;
  preMarketHolder?: boolean;
} & Record<string, unknown>;

export type NewListingRaw = {
  address: string;
  symbol?: string;
  name?: string;
  liquidity?: number;
  createdAt?: number;
} & Record<string, unknown>;
