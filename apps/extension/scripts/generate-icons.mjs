#!/usr/bin/env node
// Renders the Pulse Shield logo SVG to PNG at 16, 48, 128 px for Chrome Web
// Store + an opaque-background variant for the 128 px install icon (CWS
// recommends a square with a clear visual edge against light/dark UI).

import sharp from "sharp";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SOURCE_SVG = resolve(ROOT, "../web/public/logo-pulse.svg");
const OUT_DIR = resolve(ROOT, "src/icons");

mkdirSync(OUT_DIR, { recursive: true });

const svgSource = readFileSync(SOURCE_SVG, "utf8");

// Wrap the original SVG so the radar mark sits on a dark rounded background.
// Browsers render extension icons against neutral grey (Chrome) or window
// chrome — a solid panel keeps the cyan→emerald arcs legible everywhere.
function withBackdrop(svg) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="128" cy="128" r="120" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0F1A14"/>
      <stop offset="100%" stop-color="#050D09"/>
    </radialGradient>
  </defs>
  <rect width="256" height="256" rx="44" fill="url(#bg)"/>
  ${svg.replace(/^<\?xml[^?]+\?>/, "").replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "")}
</svg>`;
}

const SIZES = [16, 32, 48, 128];

for (const size of SIZES) {
  const out = join(OUT_DIR, `icon-${size}.png`);
  await sharp(Buffer.from(withBackdrop(svgSource)))
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`  ✓ ${size}×${size}  →  src/icons/icon-${size}.png`);
}

console.log("\nIcons generated. Run `pnpm build` to copy them into dist/.");
