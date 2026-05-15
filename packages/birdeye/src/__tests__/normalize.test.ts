import { strict as assert } from "node:assert";
import {
  normalizeHolderPositions,
  normalizeOverview,
  normalizeSecurity,
  normalizeTopHolders,
  normalizeTrending,
  normalizeTxs
} from "../normalize";
import { MOCK_FIXTURES } from "../mock-fixtures";

export async function runNormalizeTests(): Promise<void> {
  const trending = normalizeTrending(MOCK_FIXTURES.trending.tokens);
  assert.equal(trending.length, 2);
  assert.equal(trending[0].symbol, "DOGX");

  const overview = normalizeOverview(MOCK_FIXTURES.overview, "DOGX_ADDR");
  assert.equal(overview.priceChange1h, 82.4);
  assert.equal(overview.liquidityChange1h, -22.6);

  const now = Date.now();
  const txs = normalizeTxs(MOCK_FIXTURES.txs.items, now - 60 * 60 * 1000, now);
  assert.ok(txs.smartWalletSellUsd > txs.smartWalletBuyUsd);
  assert.ok(txs.insiderSellUsd > txs.insiderBuyUsd);

  const positions = normalizeHolderPositions(MOCK_FIXTURES.holderPositions);
  assert.equal(positions.insiderWalletCount, 2);
  assert.equal(positions.devWalletCount, 1);

  const top = normalizeTopHolders(MOCK_FIXTURES.topHolders);
  assert.equal(top.top10HolderPercent, 64.8);
  assert.equal(top.topHolderPercent, 18.4);

  const security = normalizeSecurity(MOCK_FIXTURES.security);
  assert.equal(security.hasMutableMetadata, true);
  assert.equal(security.hasFreezeAuthority, false);
  assert.equal(security.hasMintAuthority, true);
  assert.ok(
    security.notes.some((n) => n.includes("Mint authority")),
    "expected mint authority note"
  );

  // Edge cases
  const emptyOverview = normalizeOverview(undefined, "addr");
  assert.equal(emptyOverview.priceUsd, 0);
  assert.equal(emptyOverview.liquidityUsd, 0);

  const emptyTxs = normalizeTxs(undefined, 0, 1);
  assert.equal(emptyTxs.buyVolumeUsd, 0);
  assert.equal(emptyTxs.sellVolumeUsd, 0);
}
