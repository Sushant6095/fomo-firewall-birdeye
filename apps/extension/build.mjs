// Esbuild config for the FOMO Firewall extension.
// Produces a loadable Chrome (MV3) extension in `apps/extension/dist/`.
//
// Usage:
//   pnpm --filter @fomo/extension build
//   pnpm --filter @fomo/extension dev   # watches and rebuilds
//
// The output directory is what you load via `chrome://extensions → Load unpacked`.

import { build, context } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const dist = resolve(root, "dist");
const watch = process.argv.includes("--watch");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

// Production API base URL — what the extension calls in the wild.
// Override at build time:  EXTENSION_API_BASE_URL=https://your-domain pnpm build
// Default points at the canonical Vercel deployment.
const API_BASE_URL =
  process.env.EXTENSION_API_BASE_URL ??
  (watch
    ? "http://localhost:8727"
    : "https://fomo-firewall-birdeye.vercel.app");

const shared = {
  bundle: true,
  format: "iife",
  target: "chrome120",
  platform: "browser",
  sourcemap: watch,
  minify: !watch,
  define: {
    "process.env.NODE_ENV": JSON.stringify(watch ? "development" : "production"),
    "process.env.EXTENSION_API_BASE_URL": JSON.stringify(API_BASE_URL)
  },
  loader: { ".css": "css" }
};

const entryPoints = [
  {
    entryPoints: [resolve(root, "src/popup.tsx")],
    outfile: resolve(dist, "popup.js"),
    ...shared,
    jsx: "automatic"
  },
  {
    entryPoints: [resolve(root, "src/content.ts")],
    outfile: resolve(dist, "content.js"),
    ...shared
  },
  {
    entryPoints: [resolve(root, "src/background.ts")],
    outfile: resolve(dist, "background.js"),
    ...shared
  }
];

async function copyStatic() {
  await cp(resolve(root, "manifest.json"), resolve(dist, "manifest.json"));
  await cp(resolve(root, "popup.html"), resolve(dist, "popup.html"));
  await cp(resolve(root, "src/styles.css"), resolve(dist, "styles.css"));
  // Icons live in src/icons (rendered by scripts/generate-icons.mjs from
  // the Pulse Shield SVG). Manifest references icons/*.png — copy them in.
  const iconSrc = resolve(root, "src/icons");
  if (existsSync(iconSrc)) {
    await cp(iconSrc, resolve(dist, "icons"), { recursive: true });
  } else if (existsSync(resolve(root, "icons"))) {
    await cp(resolve(root, "icons"), resolve(dist, "icons"), { recursive: true });
  }
}

if (watch) {
  const ctxs = await Promise.all(entryPoints.map((cfg) => context(cfg)));
  await Promise.all(ctxs.map((c) => c.watch()));
  await copyStatic();
  console.log("[ext] watching for changes — Ctrl+C to exit");
} else {
  await Promise.all(entryPoints.map((cfg) => build(cfg)));
  await copyStatic();
  console.log(`[ext] built → ${dist}`);
}
