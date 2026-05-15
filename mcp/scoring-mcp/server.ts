#!/usr/bin/env tsx
/**
 * FOMO Firewall — TrapScore MCP server.
 *
 * Pure local scoring tools. No network access, no DB writes, no shell.
 * Useful for "what would the TrapScore look like if smart wallets sold $X?"
 * exploration inside Claude Code / Cursor.
 */

import { createInterface } from "node:readline";
import {
  calculateTrapScore,
  calculateTrapScoreWithSignals,
  explainTrapScore
} from "@fomo/scoring";
import type { TrapInputs } from "@fomo/shared";
import { scoringTools, type ScoringToolName } from "./tools";

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

const inputSchema = {
  type: "object",
  required: [
    "priceChange1h",
    "liquidityChange1h",
    "buyVolume1h",
    "sellVolume1h",
    "smartWalletBuyUsd",
    "smartWalletSellUsd",
    "insiderBuyUsd",
    "insiderSellUsd",
    "top10HolderPercent",
    "hasMutableMetadata",
    "hasFreezeAuthority",
    "volumeToLiquidityRatio"
  ],
  properties: {
    priceChange1h: { type: "number" },
    liquidityChange1h: { type: "number" },
    buyVolume1h: { type: "number" },
    sellVolume1h: { type: "number" },
    smartWalletBuyUsd: { type: "number" },
    smartWalletSellUsd: { type: "number" },
    insiderBuyUsd: { type: "number" },
    insiderSellUsd: { type: "number" },
    top10HolderPercent: { type: "number" },
    hasMutableMetadata: { type: "boolean" },
    hasFreezeAuthority: { type: "boolean" },
    hasMintAuthority: { type: "boolean" },
    transferFeeBps: { type: "number" },
    volumeToLiquidityRatio: { type: "number" }
  }
} as const;

const TOOL_DEFS = [
  {
    name: "scoring.calculateTrapScore" satisfies ScoringToolName,
    description:
      "Pure-function TrapScore calculation. Returns trapScore, verdict, reasons[], evidence per signal.",
    inputSchema
  },
  {
    name: "scoring.explainTrapScore",
    description:
      "Renders a 1–2 sentence analyst summary for a TrapScore. Pass `inputs` + optional `symbol`/`priceChange1h`.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: { type: "string" },
        priceChange1h: { type: "number" },
        inputs: inputSchema
      },
      required: ["inputs"]
    }
  },
  {
    name: "scoring.compareSnapshots",
    description:
      "Score two snapshots side-by-side. Returns both verdicts and the score delta.",
    inputSchema: {
      type: "object",
      properties: {
        a: inputSchema,
        b: inputSchema
      },
      required: ["a", "b"]
    }
  },
  {
    name: "scoring.generateAlertText",
    description:
      "Returns the canonical alert string the Telegram bot would send for these inputs.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: { type: "string", minLength: 1 },
        priceChange1h: { type: "number" },
        inputs: inputSchema,
        caseFileUrl: { type: "string" }
      },
      required: ["symbol", "inputs"]
    }
  }
];

function toInputs(raw: unknown): TrapInputs {
  if (!raw || typeof raw !== "object") {
    throw new Error("invalid_inputs");
  }
  const r = raw as Record<string, unknown>;
  const num = (k: string) => {
    const v = r[k];
    if (typeof v !== "number" || !Number.isFinite(v)) {
      throw new Error(`invalid_input_${k}`);
    }
    return v;
  };
  return {
    priceChange1h: num("priceChange1h"),
    liquidityChange1h: num("liquidityChange1h"),
    buyVolume1h: num("buyVolume1h"),
    sellVolume1h: num("sellVolume1h"),
    smartWalletBuyUsd: num("smartWalletBuyUsd"),
    smartWalletSellUsd: num("smartWalletSellUsd"),
    insiderBuyUsd: num("insiderBuyUsd"),
    insiderSellUsd: num("insiderSellUsd"),
    top10HolderPercent: num("top10HolderPercent"),
    hasMutableMetadata: r.hasMutableMetadata === true,
    hasFreezeAuthority: r.hasFreezeAuthority === true,
    hasMintAuthority: r.hasMintAuthority === true,
    transferFeeBps: typeof r.transferFeeBps === "number" ? r.transferFeeBps : 0,
    volumeToLiquidityRatio: num("volumeToLiquidityRatio")
  };
}

const HANDLERS: Record<string, (args: Record<string, unknown>) => unknown> = {
  "scoring.calculateTrapScore": (args) =>
    calculateTrapScoreWithSignals(toInputs(args)),
  "scoring.explainTrapScore": (args) => {
    const inputs = toInputs(args.inputs);
    const result = calculateTrapScore(inputs);
    return {
      result,
      summary: explainTrapScore({
        symbol: typeof args.symbol === "string" ? args.symbol : "TOKEN",
        priceChange1h:
          typeof args.priceChange1h === "number" ? args.priceChange1h : undefined,
        result
      })
    };
  },
  "scoring.compareSnapshots": (args) => {
    const a = calculateTrapScore(toInputs(args.a));
    const b = calculateTrapScore(toInputs(args.b));
    return {
      a,
      b,
      scoreDelta: b.trapScore - a.trapScore,
      verdictChange: a.verdict !== b.verdict ? { from: a.verdict, to: b.verdict } : null
    };
  },
  "scoring.generateAlertText": (args) => {
    const symbol =
      typeof args.symbol === "string" && args.symbol.length > 0
        ? args.symbol
        : "TOKEN";
    const inputs = toInputs(args.inputs);
    const result = calculateTrapScore(inputs);
    const reasons = result.reasons.slice(0, 3).map((r) => `• ${r.message}`).join("\n");
    const caseUrl =
      typeof args.caseFileUrl === "string" && args.caseFileUrl.length > 0
        ? args.caseFileUrl
        : `http://localhost:3000/token/${symbol}`;
    return {
      text: [
        `FOMO Firewall · ${result.verdict}`,
        `$${symbol}`,
        `TrapScore: ${result.trapScore}/100`,
        reasons ? `\nWhy:\n${reasons}` : "",
        `\nCase file: ${caseUrl}`
      ]
        .filter(Boolean)
        .join("\n")
    };
  }
};

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
    try {
      const result = handler(args);
      audit(name, true);
      return { jsonrpc: "2.0", id: req.id ?? null, result };
    } catch (err) {
      audit(name, false);
      const message = err instanceof Error ? err.message.slice(0, 200) : "tool_failed";
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

function audit(tool: string, ok: boolean): void {
  console.error(
    JSON.stringify({
      t: new Date().toISOString(),
      mcp: "scoring",
      tool,
      ok
    })
  );
}

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

console.error("[scoring-mcp] ready. tools:", scoringTools.length);
