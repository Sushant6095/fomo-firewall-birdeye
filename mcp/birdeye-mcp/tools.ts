/**
 * Allow-list of Birdeye MCP tool names. The server in this folder is the
 * authoritative implementation — clients use these strings to call via the
 * MCP JSON-RPC `tools/call` method.
 */
export const birdeyeTools = [
  "birdeye.getTrendingTokens",
  "birdeye.getTokenOverview",
  "birdeye.getTokenTxs",
  "birdeye.getHolderProfile",
  "birdeye.getHolderPositions",
  "birdeye.getTokenSecurity",
  "birdeye.getTopHolders"
] as const;

export type BirdeyeToolName = (typeof birdeyeTools)[number];
