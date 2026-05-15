# MCP Servers

Local-development MCP (Model Context Protocol) servers. **These are for
developer tooling only** — the public web app, Telegram bot, and browser
extension never depend on them.

## Servers

- `birdeye-mcp/` — read-only access to the FOMO Firewall Birdeye client.
- `scoring-mcp/` — pure-function TrapScore tools.

## Hard rules (enforced by both servers)

- **Read-only by default.** No shell execution. No file writes. No DB mutation.
- **No wallet signing. No trading execution.**
- **No broad filesystem access.** The servers only import from this monorepo's
  own packages.
- **No secrets in tool outputs.** `BIRDEYE_API_KEY` is read once on boot and
  never echoed back — accidental error-message leakage is scrubbed before the
  JSON-RPC response is emitted.
- **Narrow input schemas.** Every tool declares its `inputSchema`. Unknown
  keys are dropped at the handler boundary.
- **Audit logs.** Every tool call writes a single JSON line to stderr with
  `tool`, `argsHash` (sha256 prefix only — never raw args), `ms`, and `ok`.

## Running

```bash
# Birdeye MCP (needs BIRDEYE_API_KEY in env).
pnpm --filter @fomo/birdeye-mcp start

# Scoring MCP (no env required).
pnpm --filter @fomo/scoring-mcp start
```

Each server speaks JSON-RPC over stdio. Tool list:

```
birdeye.getTrendingTokens
birdeye.getTokenOverview
birdeye.getTokenTxs
birdeye.getHolderProfile
birdeye.getHolderPositions
birdeye.getTokenSecurity
birdeye.getTopHolders

scoring.calculateTrapScore
scoring.explainTrapScore
scoring.compareSnapshots
scoring.generateAlertText
```

## Wiring into Claude Code / Cursor

Add to your local MCP config (path may vary by editor):

```jsonc
{
  "mcpServers": {
    "fomo-birdeye": {
      "command": "pnpm",
      "args": ["--filter", "@fomo/birdeye-mcp", "start"],
      "cwd": "/absolute/path/to/fomo-firewall-bootstrap",
      "env": { "BIRDEYE_API_KEY": "…" }
    },
    "fomo-scoring": {
      "command": "pnpm",
      "args": ["--filter", "@fomo/scoring-mcp", "start"],
      "cwd": "/absolute/path/to/fomo-firewall-bootstrap"
    }
  }
}
```

Once wired, you can ask:

- *"Show me the TrapScore for `DoGx…`"* (uses `scoring.calculateTrapScore` over Birdeye-enriched inputs)
- *"What does this token's overview look like?"* (uses `birdeye.getTokenOverview`)
- *"Compare these two snapshots and tell me which is the trap."*

The servers never write to your DB, never call wallets, never run shells.
