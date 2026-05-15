import { runFormatTests } from "./format.test";
import { runDispatchTests } from "./dispatch.test";

async function main() {
  let failed = 0;
  for (const [name, runner] of [
    ["format", runFormatTests],
    ["dispatch", runDispatchTests]
  ] as const) {
    try {
      await runner();
      console.log(`[bot] ${name}: PASS`);
    } catch (err) {
      failed += 1;
      console.error(`[bot] ${name}: FAIL`, err);
    }
  }
  if (failed > 0) process.exit(1);
}

main();
