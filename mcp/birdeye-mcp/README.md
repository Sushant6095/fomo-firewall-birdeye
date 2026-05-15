# Birdeye MCP Blueprint

Read-only local development tools:

- `birdeye.getTrendingTokens`
- `birdeye.getTokenOverview`
- `birdeye.getTokenTxs`
- `birdeye.getHolderProfile`
- `birdeye.getHolderPositions`
- `birdeye.getTokenSecurity`
- `birdeye.getTopHolders`

Rules:

- API key loaded only from local environment.
- Never return API key.
- Never write files.
- Never trade.
- Never sign transactions.
