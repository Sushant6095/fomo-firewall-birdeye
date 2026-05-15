import { runTrapScoreTests } from "./trap-score.test";
import { runInputsTests } from "./inputs.test";

async function main() {
  let failed = 0;
  for (const [name, runner] of [
    ["trap-score", runTrapScoreTests],
    ["inputs", runInputsTests]
  ] as const) {
    try {
      await runner();
      console.log(`[scoring] ${name}: PASS`);
    } catch (err) {
      failed += 1;
      console.error(`[scoring] ${name}: FAIL`, err);
    }
  }
  if (failed > 0) process.exit(1);
}

main();
