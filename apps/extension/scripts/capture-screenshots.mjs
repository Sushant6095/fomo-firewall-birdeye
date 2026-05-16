#!/usr/bin/env node
// Captures 5 Chrome-Web-Store-ready screenshots of the FOMO Firewall web app
// at exactly 1280x800. Output: apps/extension/store-assets/*.png
//
// Prereq: dev server running on http://localhost:8727 (pnpm --filter @fomo/web dev)
// Usage:  node scripts/capture-screenshots.mjs

import { chromium } from "playwright";
import { mkdirSync, existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "store-assets");
const BASE = process.env.CAPTURE_BASE_URL || "http://localhost:8727";
const MINT = "DoGxJTRP7nKpRrjEYRr7nT9hZqEqL8mTjYR4hM7N2ZpL";

const SHOTS = [
  { name: "1-dashboard.png", path: "/", wait: 1800 },
  { name: "2-threat-board.png", path: "/board", wait: 1500 },
  { name: "3-signals.png", path: "/signals", wait: 1500 },
  { name: "4-case-file.png", path: `/case-file/${MINT}`, wait: 1800 },
  { name: "5-alerts.png", path: "/alerts", wait: 1500 }
];

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

console.log(`→ launching headless Chromium at 1280×800`);
console.log(`→ base url: ${BASE}`);
console.log(`→ output:   ${OUT_DIR}\n`);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
  colorScheme: "dark"
});
const page = await ctx.newPage();

for (const shot of SHOTS) {
  const url = `${BASE}${shot.path}`;
  process.stdout.write(`  ${shot.name.padEnd(22)} ← ${shot.path} ...`);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    // Wait for the page to render past the loading skeleton; networkidle doesn't
    // work here because some routes have polling/SSE that keeps the network busy.
    await page.waitForLoadState("load", { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(shot.wait);
    const outPath = resolve(OUT_DIR, shot.name);
    await page.screenshot({
      path: outPath,
      fullPage: false,
      type: "png",
      omitBackground: false
    });
    const kb = (statSync(outPath).size / 1024).toFixed(1);
    console.log(` ✓ ${kb} KB`);
  } catch (err) {
    console.log(` ✗ ${err.message}`);
  }
}

await browser.close();
console.log(`\n✓ done. Drop these into the CWS Screenshots field:`);
for (const s of SHOTS) console.log(`   ${resolve(OUT_DIR, s.name)}`);
