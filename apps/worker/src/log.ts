/**
 * Tiny structured logger for the worker. Avoids pulling in pino for the
 * hackathon build — JSON lines, run-id correlation, no external deps.
 */

type Level = "info" | "warn" | "error" | "debug";

let CURRENT_RUN_ID = "boot";

export function setRunId(id: string): void {
  CURRENT_RUN_ID = id;
}

export const log = {
  info: (msg: string, meta?: Record<string, unknown>) => emit("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit("error", msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => emit("debug", msg, meta)
};

function emit(level: Level, msg: string, meta?: Record<string, unknown>): void {
  const line = JSON.stringify({
    t: new Date().toISOString(),
    level,
    run_id: CURRENT_RUN_ID,
    msg,
    ...(meta ?? {})
  });
  if (level === "error") console.error(line);
  else console.log(line);
}
