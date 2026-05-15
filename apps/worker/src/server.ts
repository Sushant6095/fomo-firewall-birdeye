import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { runIngestion } from "./index";
import { log } from "./log";

const PORT = Number(process.env.PORT ?? 4001);
const WORKER_SECRET = process.env.WORKER_SECRET ?? "";

/**
 * Minimal worker HTTP server.
 *
 * - `POST /run` — runs one ingestion pass. Requires `x-worker-secret`.
 * - `GET  /health` — liveness probe (returns 200 OK).
 *
 * Production cron services (Vercel cron, Supabase cron, GitHub Actions)
 * trigger this endpoint with a shared secret.
 */
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === "POST" && req.url === "/run") {
    if (!isAuthorized(req)) {
      res.writeHead(401, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "unauthorized" }));
      return;
    }
    try {
      const summary = await runIngestion();
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(summary));
    } catch (err) {
      log.error("run failed", { error: err instanceof Error ? err.message : String(err) });
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "run_failed" }));
    }
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "not_found" }));
});

function isAuthorized(req: IncomingMessage): boolean {
  if (!WORKER_SECRET) return false;
  const provided = req.headers["x-worker-secret"];
  if (typeof provided !== "string") return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(WORKER_SECRET);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

server.listen(PORT, () => {
  log.info(`worker http listening on :${PORT}`);
});
