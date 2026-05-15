# @fomo/birdeye

Server-only Birdeye API client used by `apps/worker` and Next.js route handlers. Every endpoint maps to a product signal — we do **not** ship raw Birdeye data to the UI.

## Hard rules

- **Server-only.** Never imported from `apps/web/components/**` or `apps/extension/**`.
- **API key handling.** `BIRDEYE_API_KEY` is the *only* place the key appears. No client bundle, no logs, no error messages.
- **Rate-limited.** Token-bucket limiter defaults to 8 rps; configurable via `BIRDEYE_RPS`.
- **Resilient.** Exponential backoff with jitter on 429 / 5xx / network errors (max 3 retries).
- **Typed at the boundary.** Every payload passes through `normalize.ts` to become strict, internal records before it leaves the package.

## Endpoint → product signal map

| Endpoint                          | Method on `BirdeyeClient`  | Powers (TrapScore signal)                                |
| --------------------------------- | -------------------------- | --------------------------------------------------------- |
| `/defi/token_trending`            | `getTrendingTokens`        | Risk Board scope — which tokens to score                  |
| `/defi/token_overview`            | `getTokenOverview`         | Price / liquidity / 1h volume / 1h price change           |
| `/defi/v3/token/txs`              | `getTokenTxs`              | Smart Money Divergence, Insider Exit Pressure, Sell Pressure While Green |
| `/token/v1/holder-profile`        | `getHolderProfile`         | Smart wallet & insider netflow                            |
| `/token/v1/holder-positions`      | `getHolderPositions`       | Insider wallet count, dev exposure                        |
| `/defi/v3/token/holder`           | `getTopHolders`            | Holder Concentration Risk                                 |
| `/defi/token_security`            | `getTokenSecurity`         | Static Token Risk (mutable metadata, mint/freeze authority, transfer fee) |
| `/defi/v2/tokens/new_listing`     | `getNewListings`           | New-listing radar (Phase J optional)                      |

## Files

```
packages/birdeye/
  README.md                        ← you are here
  package.json
  tsconfig.json
  src/
    index.ts                       # barrel — public surface
    types.ts                       # permissive Birdeye payload shapes
    client.ts                      # BirdeyeClient (rate-limit + retry + typed)
    rate-limit.ts                  # token-bucket limiter
    retry.ts                       # exp backoff + BirdeyeRequestError
    normalize.ts                   # payload → strict internal shape
    enrich.ts                      # one address → EnrichedSnapshot
    mock-fixtures.ts               # offline development fixtures
    __tests__/
      run.ts                       # tsx entrypoint
      normalize.test.ts
      rate-limit.test.ts
```

## Quick usage

```ts
import { BirdeyeClient, enrichToken } from "@fomo/birdeye";

const client = new BirdeyeClient({
  apiKey: process.env.BIRDEYE_API_KEY!,
  rateLimit: { ratePerSecond: 8 }
});

const { snapshot, warnings } = await enrichToken(
  client,
  "DoGxJTRP7nKpRrjEYRr7nT9hZqEqL8mTjYR4hM7N2ZpL"
);
// snapshot → EnrichedSnapshot (typed in @fomo/shared)
// warnings  → string[] (per-endpoint failures, non-fatal)
```

## Offline development

`mock-fixtures.ts` exports happy-path data shaped exactly like the public API. The worker test suite reuses these so we can replay the entire scoring pipeline without an API key.

## Running tests

```bash
pnpm --filter @fomo/birdeye test
```

Covers:

- `normalize.test.ts` — golden-fixture round-trip per endpoint plus the missing-data fallbacks.
- `rate-limit.test.ts` — verifies burst capacity and the steady-state token refill.
