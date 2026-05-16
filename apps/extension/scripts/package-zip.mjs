#!/usr/bin/env node
// Produces a Chrome-Web-Store-ready zip of the extension's dist/ folder.
// The zip name embeds the version from manifest.json so uploads are unambiguous.
//
// Usage:
//   pnpm --filter @fomo/extension zip
// Output:
//   apps/extension/fomo-firewall-extension-v<version>.zip

import { execSync } from "node:child_process";
import { readFileSync, existsSync, statSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");

if (!existsSync(DIST)) {
  console.error("✗ dist/ not found. Run `pnpm build` first.");
  process.exit(1);
}

// Sanity check the manifest before zipping.
const manifest = JSON.parse(
  readFileSync(resolve(DIST, "manifest.json"), "utf8")
);
const required = [
  ["name", manifest.name],
  ["version", manifest.version],
  ["description", manifest.description],
  ["icons", manifest.icons],
  ["action.default_icon", manifest.action?.default_icon]
];
const missing = required.filter(([, v]) => !v);
if (missing.length > 0) {
  console.error("✗ manifest.json missing required fields:");
  missing.forEach(([k]) => console.error(`    - ${k}`));
  process.exit(1);
}
if (
  Array.isArray(manifest.host_permissions) &&
  manifest.host_permissions.some((h) => /localhost|127\.0\.0\.1/.test(h))
) {
  console.error(
    "✗ manifest.host_permissions contains localhost. Chrome Web Store will reject this. Remove from manifest.json and rebuild."
  );
  process.exit(1);
}
for (const size of ["16", "48", "128"]) {
  const p = resolve(DIST, "icons", `icon-${size}.png`);
  if (!existsSync(p)) {
    console.error(`✗ missing icon: ${p}`);
    process.exit(1);
  }
  const bytes = statSync(p).size;
  if (bytes < 200) {
    console.error(`✗ icon too small (${bytes} bytes): ${p}`);
    process.exit(1);
  }
}

const zipName = `fomo-firewall-extension-v${manifest.version}.zip`;
const zipPath = resolve(ROOT, zipName);

if (existsSync(zipPath)) rmSync(zipPath);

// Zip the CONTENTS of dist/, not dist/ itself — CWS wants manifest.json at
// the root of the archive.
execSync(`cd "${DIST}" && zip -r "${zipPath}" . -x ".DS_Store" -x "*.map"`, {
  stdio: "inherit"
});

const bytes = statSync(zipPath).size;
const kb = (bytes / 1024).toFixed(1);
console.log(`\n✓ ${zipName} (${kb} KB)`);
console.log(`  ${zipPath}\n`);
console.log("Next steps:");
console.log("  1. https://chrome.google.com/webstore/devconsole");
console.log("  2. New item → upload this zip");
console.log("  3. Paste listing copy from apps/extension/CHROME_WEB_STORE_LISTING.md");
console.log("  4. Add 1–5 screenshots at 1280×800");
console.log("  5. Submit for review (3–7 day queue)");
