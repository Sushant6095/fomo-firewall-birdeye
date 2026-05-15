#!/usr/bin/env tsx
/**
 * FOMO Firewall — Birdeye MCP server.
 *
 * Speaks the Model Context Protocol JSON-RPC dialect over stdio. Exposes a
 * narrow, read-only surface over the Birdeye client for local development
 * (Claude Code, Cursor, etc.).
 *
 * Hard rules:
 *  - Read-only — no shell execution, no file writes, no wallet signing.
 *  - `BIRDEYE_API_KEY` is read once on boot and is **never** echoed back in
 *    any tool response, error message, or log line.
 *  - Each tool has a narrow JSON-Schema input; unknown keys are dropped.
 *  - Every call is audit-logged to stderr with `tool`, `argsHash`, `ms`.
 */

import { createInterface } from "node:readline";
import { createHash } from "node:crypto";
import { BirdeyeClient } from "@fomo/birdeye";
import { birdeyeTools, type BirdeyeToolName } from "./tools";

const API_KEY = process.env.BIRDEYE_API_KEY;
if (!API_KEY) {
  console.error("[birdeye-mcp] missing BIRDEYE_API_KEY; refusing to start");
  process.exit(1);
}

const client = new BirdeyeClient({
  apiKey: API_KEY,
  baseUrl: process.env.BIRDEYE_BASE_URL,
  chain: process.env.BIRDEYE_CHAIN ?? "solana",
  rateLimit: { ratePerSecond: Number(process.env.BIRDEYE_RPS ?? "8") }
});

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: number | string | null;
  method: string;
  params?: Record<string, unknown>;
};

type JsonRpcResponse = {
  jsonrpc: "2.0";
  id?: number | string | null;
  result?: unknown;
  error?: { code: number; message: string };
};

const TOOL_DEFS = [
  {
    name: "birdeye.getTrendingTokens" satisfies BirdeyeToolName,
    description: "Read-only list of trending Solana tokens. No mutation.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 50 },
        interval: { type: "string", enum: ["1h", "4h", "24h"] }
      },
      additionalProperties: false
    }
  },
  {
    name: "birdeye.getTokenOverview",
    description: "Market overview for a single mint (price, liquidity, 1h volume).",
    inputSchema: {
      type: "object",
      properties: { address: { type: "string", minLength: 32, maxLength: 44 } },
      required: ["address"],
      additionalProperties: false
    }
  },
  {
    name: "birdeye.getTokenTxs",
    description: "Recent trades for a mint. Used for smart-money / insider netflow.",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string", minLength: 32, maxLength: 44 },
        limit: { type: "integer", minimum: 1, maximum: 100 }
      },
      required: ["address"],
      additionalProperties: false
    }
  },
  {
    name: "birdeye.getHolderProfile",
    description: "Smart-money + insider netflow summary for a mint.",
    inputSchema: {
      type: "object",
      properties: { address: { type: "string", minLength: 32, maxLength: 44 } },
      required: ["address"],
      additionalProperties: false
    }
  },
  {
    name: "birdeye.getHolderPositions",
    description: "Per-wallet insider/dev positions for a mint.",
    inputSchema: {
      type: "object",
      properties: { address: { type: "string", minLength: 32, maxLength: 44 } },
      required: ["address"],
      additionalProperties: false
    }
  },
  {
    name: "birdeye.getTopHolders",
    description: "Top-N holder distribution for a mint.",
    inputSchema: {
      type: "object",
      properties: { address: { type: "string", minLength: 32, maxLength: 44 } },
      required: ["address"],
      additionalProperties: false
    }
  },
  {
    name: "birdeye.getTokenSecurity",
    description: "Static security flags for a mint (mutable metadata, authorities).",
    inputSchema: {
      type: "object",
      properties: { address: { type: "string", minLength: 32, maxLength: 44 } },
      required: ["address"],
      additionalProperties: false
    }
  }
];

const HANDLERS: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
  "birdeye.getTrendingTokens": (args) =>
    client.getTrendingTokens({
      limit: numArg(args.limit, 20),
      interval: strArg(args.interval, "1h")
    }),
  "birdeye.getTokenOverview": (args) =>
    client.getTokenOverview(requireAddress(args)),
  "birdeye.getTokenTxs": (args) =>
    client.getTokenTxs(requireAddress(args), { limit: numArg(args.limit, 50) }),
  "birdeye.getHolderProfile": (args) =>
    client.getHolderProfile(requireAddress(args)),
  "birdeye.getHolderPositions": (args) =>
    client.getHolderPositions(requireAddress(args)),
  "birdeye.getTopHolders": (args) =>
    client.getTopHolders(requireAddress(args)),
  "birdeye.getTokenSecurity": (args) =>
    client.getTokenSecurity(requireAddress(args))
};

function requireAddress(args: Record<string, unknown>): string {
  const a = args.address;
  if (typeof a !== "string" || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a)) {
    throw new Error("invalid_address");
  }
  return a;
}
function numArg(v: unknown, def: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : def;
}
function strArg<T extends string>(v: unknown, def: T): T {
  return typeof v === "string" ? (v as T) : def;
}

async function dispatch(req: JsonRpcRequest): Promise<JsonRpcResponse> {
  if (req.method === "tools/list") {
    return { jsonrpc: "2.0", id: req.id ?? null, result: { tools: TOOL_DEFS } };
  }
  if (req.method === "tools/call") {
    const params = req.params ?? {};
    const name = String(params.name ?? "");
    const args = (params.arguments as Record<string, unknown>) ?? {};
    const handler = HANDLERS[name];
    if (!handler) {
      return {
        jsonrpc: "2.0",
        id: req.id ?? null,
        error: { code: -32601, message: `unknown tool: ${name}` }
      };
    }
    const started = Date.now();
    try {
      const result = await handler(args);
      audit(name, args, Date.now() - started, true);
      return { jsonrpc: "2.0", id: req.id ?? null, result };
    } catch (err) {
      audit(name, args, Date.now() - started, false);
      const message = err instanceof Error ? sanitize(err.message) : "tool_failed";
      return {
        jsonrpc: "2.0",
        id: req.id ?? null,
        error: { code: -32000, message }
      };
    }
  }
  return {
    jsonrpc: "2.0",
    id: req.id ?? null,
    error: { code: -32601, message: `unknown method: ${req.method}` }
  };
}

function audit(
  tool: string,
  args: Record<string, unknown>,
  ms: number,
  ok: boolean
): void {
  // Hash the args so we never log raw addresses or secrets.
  const argsHash = createHash("sha256")
    .update(JSON.stringify(args))
    .digest("hex")
    .slice(0, 12);
  console.error(
    JSON.stringify({
      t: new Date().toISOString(),
      mcp: "birdeye",
      tool,
      argsHash,
      ms,
      ok
    })
  );
}

function sanitize(msg: string): string {
  // Strip any accidental key echo.
  if (API_KEY && msg.includes(API_KEY)) return "internal_error";
  return msg.slice(0, 200);
}

// stdio JSON-RPC loop.
const rl = createInterface({ input: process.stdin });
rl.on("line", async (line) => {
  if (!line.trim()) return;
  let req: JsonRpcRequest;
  try {
    req = JSON.parse(line) as JsonRpcRequest;
  } catch {
    return;
  }
  const resp = await dispatch(req);
  process.stdout.write(`${JSON.stringify(resp)}\n`);
});

console.error("[birdeye-mcp] ready. listing tools:", birdeyeTools.length);
