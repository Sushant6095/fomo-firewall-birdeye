# Birdeye Endpoint Map

Use Birdeye as the real-time onchain data layer. FOMO Firewall is the intelligence layer built on top.

## Required endpoints

### `/defi/token_trending`

Purpose: discovery.

Use it to find tokens already attracting market attention. This is the top of the funnel for FOMO Firewall.

Product fields:

- token address
- token symbol/name
- rank/trending status
- liquidity context
- volume context
- price change context

### `/defi/token_overview`

Purpose: market snapshot.

Use it to enrich each token with current market state.

Product fields:

- price
- liquidity
- volume by frame
- price change by frame
- market cap/FDV when available
- trade counts when available

### `/defi/v3/token/txs`

Purpose: evidence engine.

Use it to inspect recent transaction flow.

Product calculations:

- buy volume vs sell volume
- large sell detection
- large buy detection
- add-liquidity events
- remove-liquidity events
- windowed order-flow changes

### `/token/v1/holder-profile`

Purpose: holder intelligence summary.

Use it to understand holder composition and tagged holder groups.

Product calculations:

- smart trader presence
- insider/dev/sniper/bundler exposure
- holder quality distribution
- risk tags for score explanations

### `/token/v1/holder-positions`

Purpose: tagged wallet behavior.

Use it to inspect tagged holders and estimate netflow by wallet category.

Product calculations:

- smart wallet buy/sell volume
- smart wallet netflow
- insider/dev netflow
- high-PnL holder activity
- wallet-level conviction decay

### `/defi/v3/token/holder`

Purpose: concentration.

Use it to measure supply distribution.

Product calculations:

- top 10 holder percentage
- top 20 holder percentage
- whale concentration
- concentration change across snapshots

### `/defi/token_security`

Purpose: static token risk.

Use it as a supporting risk layer.

Product calculations:

- mutable metadata risk
- freeze authority risk
- mint authority risk
- creator/owner concentration
- transfer restriction risk
- token-2022/fee behavior risk when present

### `/defi/v2/tokens/new_listing`

Purpose: secondary discovery only.

Do not make this the main product, because token radar is crowded. Use it to catch fresh tokens that enter trending quickly or show early exit-risk patterns.

## Endpoint principle

Do not just display API output. Every endpoint must feed a product signal.

Bad:

- "Here are trending tokens."

Good:

- "This token is trending, but smart wallets have turned net sellers and liquidity is weakening. TrapScore 84."
