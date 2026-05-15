#!/usr/bin/env node
// CI gate: ensures no server-only secret ever ends up inside a built client
// bundle. Runs after `pnpm build`. Non-zero exit on any hit.
//
// Targets:
//   - apps/web/.next/static/**         (browser-side Next.js chunks)
//   - apps/extension/dist/**           (extension bundle)
//
// Forbidden tokens:
//   - BIRDEYE_API_KEY
//   - SUPABASE_SERVICE_ROLE_KEY
//   - TELEGRAM_BOT_TOKEN
//   - WORKER_SECRET
//
// We grep the *literal env-var names* rather than their values so this works
// in CI without any secrets present. A leak would look like:
//   "X-API-KEY":"BIRDEYE_API_KEY"   (process.env.BIRDEYE_API_KEY not inlined)
// or:
//   "X-API-KEY":"sk_live_..."       (real key inlined — also caught if we
//                                    extend FORBIDDEN_VALUES via env)

import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const TARGETS = [
  resolve(root, "apps/web/.next/static"),
  resolve(root, "apps/extension/dist")
];

const FORBIDDEN_NAMES = [
  "BIRDEYE_API_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "TELEGRAM_BOT_TOKEN",
  "WORKER_SECRET"
];

// Optional: pass through real secret values from env so we also catch inlined
// literals. Empty/short values are skipped to avoid false positives.
const FORBIDDEN_VALUES = FORBIDDEN_NAMES.map((n) => process.env[n]).filter(
  (v) => typeof v === "string" && v.length >= 12
);

const ALL_FORBIDDEN = [...FORBIDDEN_NAMES, ...FORBIDDEN_VALUES];

const EXTS = new Set([".js", ".css", ".mjs", ".cjs", ".html", ".map"]);

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(path, out);
    } else if (entry.isFile()) {
      const dot = entry.name.lastIndexOf(".");
      if (dot < 0) continue;
      const ext = entry.name.slice(dot).toLowerCase();
      if (EXTS.has(ext)) out.push(path);
    }
  }
  return out;
}

async function scanFile(path) {
  const hits = [];
  const text = await readFile(path, "utf8").catch(() => "");
  if (!text) return hits;
  for (const needle of ALL_FORBIDDEN) {
    if (text.includes(needle)) hits.push(needle);
  }
  return hits;
}

async function main() {
  let leaks = 0;
  let scanned = 0;

  for (const target of TARGETS) {
    if (!existsSync(target)) {
      console.log(`[check-secrets] skip (not built yet): ${target}`);
      continue;
    }
    const info = await stat(target);
    if (!info.isDirectory()) continue;

    const files = await walk(target);
    for (const file of files) {
      scanned += 1;
      const hits = await scanFile(file);
      if (hits.length > 0) {
        leaks += 1;
        console.error(`✖ ${file}`);
        for (const h of hits) console.error(`    leaked: ${h}`);
      }
    }
  }

  if (leaks > 0) {
    console.error(
      `\n[check-secrets] FAIL — ${leaks} client bundle file(s) contain server-only identifiers.`
    );
    process.exit(1);
  }
  console.log(`[check-secrets] OK — scanned ${scanned} files, no leaks.`);
}

main().catch((err) => {
  console.error("[check-secrets] crashed", err);
  process.exit(1);
});
