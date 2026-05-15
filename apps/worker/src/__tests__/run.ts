import { runPipelineTests } from "./pipeline.test";

async function main() {
  let failed = 0;
  for (const [name, runner] of [["pipeline", runPipelineTests]] as const) {
    try {
      await runner();
      console.log(`[worker] ${name}: PASS`);
    } catch (err) {
      failed += 1;
      console.error(`[worker] ${name}: FAIL`, err);
    }
  }
  if (failed > 0) process.exit(1);
}

main();
