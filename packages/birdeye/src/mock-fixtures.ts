/**
 * Local development fixtures shaped like Birdeye payloads. They cover the
 * happy path for each endpoint so unit tests and offline demos can exercise
 * the entire scoring pipeline without ever hitting the public API.
 */

import type {
  HolderPositionsRaw,
  HolderProfileRaw,
  TokenOverviewRaw,
  TokenSecurityRaw,
  TokenTxRaw,
  TopHoldersRaw,
  TrendingTokenRaw
} from "./types";

const DOGX = "DoGxJTRP7nKpRrjEYRr7nT9hZqEqL8mTjYR4hM7N2ZpL";

export const MOCK_TRENDING: { tokens: TrendingTokenRaw[] } = {
  tokens: [
    {
      address: DOGX,
      symbol: "DOGX",
      name: "Dogx",
      price: 0.0042,
      liquidity: 318_000,
      volume24hUSD: 12_400_000,
      rank: 1
    },
    {
      address: "JitO9d5fH8gTpL7pXqNwM2yK1jVeR8sB4dM7eY1pR4uN",
      symbol: "JITO",
      name: "Clean Pump Example",
      price: 2.41,
      liquidity: 8_400_000,
      volume24hUSD: 4_800_000,
      rank: 2
    }
  ]
};

export const MOCK_OVERVIEW: TokenOverviewRaw = {
  address: DOGX,
  symbol: "DOGX",
  name: "Dogx",
  price: 0.0042,
  liquidity: 318_000,
  v1hUSD: 4_120_000,
  vBuy1hUSD: 1_880_000,
  vSell1hUSD: 2_240_000,
  priceChange1hPercent: 82.4,
  liquidityChange1hPercent: -22.6,
  mc: 4_200_000,
  fdv: 6_400_000
};

const NOW_S = Math.floor(Date.now() / 1000);
export const MOCK_TXS: { items: TokenTxRaw[] } = {
  items: [
    {
      side: "sell",
      volumeInUSD: 75_000,
      isSmartMoney: true,
      blockUnixTime: NOW_S - 60
    },
    {
      side: "sell",
      volumeInUSD: 121_900,
      isSmartMoney: true,
      blockUnixTime: NOW_S - 120
    },
    {
      side: "sell",
      volumeInUSD: 73_300,
      isInsider: true,
      blockUnixTime: NOW_S - 180
    },
    {
      side: "buy",
      volumeInUSD: 12_400,
      isSmartMoney: true,
      blockUnixTime: NOW_S - 240
    },
    {
      side: "buy",
      volumeInUSD: 2_100,
      isInsider: true,
      blockUnixTime: NOW_S - 300
    },
    {
      side: "buy",
      volumeInUSD: 1_700_000,
      blockUnixTime: NOW_S - 1_500
    },
    {
      side: "sell",
      volumeInUSD: 2_046_500,
      blockUnixTime: NOW_S - 600
    }
  ]
};

export const MOCK_HOLDER_PROFILE: HolderProfileRaw = {
  address: DOGX,
  smartMoneyNetflow1hUSD: -184_500,
  insiderNetflow1hUSD: -71_200,
  topHolderConcentration: 64.8
};

export const MOCK_HOLDER_POSITIONS: HolderPositionsRaw = {
  insiders: [
    { owner: "InS1d3rWaLLet1", uiAmount: 1_200_000, usdValue: 38_400 },
    { owner: "InS1d3rWaLLet2", uiAmount: 980_000, usdValue: 32_800 }
  ],
  devs: [{ owner: "DevWaLLet1", uiAmount: 4_200_000, usdValue: 142_000 }]
};

export const MOCK_TOP_HOLDERS: TopHoldersRaw = {
  topTen: 64.8,
  topTwenty: 81.2,
  items: [
    { owner: "Whale1", percentage: 18.4 },
    { owner: "Whale2", percentage: 12.6 },
    { owner: "Whale3", percentage: 8.1 }
  ]
};

export const MOCK_SECURITY: TokenSecurityRaw = {
  isMutable: true,
  freezeAuthority: null,
  mintAuthority: "MintAuthWaLLet",
  transferFeeBps: 0,
  fakeToken: false
};

export const MOCK_FIXTURES = {
  trending: MOCK_TRENDING,
  overview: MOCK_OVERVIEW,
  txs: MOCK_TXS,
  holderProfile: MOCK_HOLDER_PROFILE,
  holderPositions: MOCK_HOLDER_POSITIONS,
  topHolders: MOCK_TOP_HOLDERS,
  security: MOCK_SECURITY
};
