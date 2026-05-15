/**
 * Tiny test runner — runs all `*.test.ts` files in this folder via tsx.
 * Each test file logs its own pass/fail lines and throws on failure.
 */

import { runNormalizeTests } from "./normalize.test";
import { runRateLimitTests } from "./rate-limit.test";

async function main() {
  let failed = 0;
  for (const [name, runner] of [
    ["normalize", runNormalizeTests],
    ["rate-limit", runRateLimitTests]
  ] as const) {
    try {
      await runner();
      console.log(`[birdeye] ${name}: PASS`);
    } catch (err) {
      failed += 1;
      console.error(`[birdeye] ${name}: FAIL`, err);
    }
  }
  if (failed > 0) process.exit(1);
}

main();
