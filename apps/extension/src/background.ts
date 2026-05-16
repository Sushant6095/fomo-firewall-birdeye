/**
 * FOMO Firewall service worker.
 *
 * Responsibilities (kept intentionally minimal):
 *  - Welcome new installs.
 *  - Listen for `ff:open-case-file` runtime messages from the popup / badge
 *    and route them to a new tab on the FOMO Firewall web app.
 *
 * Notes:
 *  - The service worker never reads Birdeye credentials.
 *  - All risk scoring happens server-side; we only proxy intents.
 */

// Injected at build time by esbuild's `define` (see build.mjs).
// pnpm build       → https://fomo-firewall-birdeye.vercel.app
// pnpm dev         → http://localhost:8727
// EXTENSION_API_BASE_URL=… pnpm build → custom override
declare const process: { env: { EXTENSION_API_BASE_URL?: string } };
const BACKEND_URL =
  (typeof process !== "undefined" && process.env?.EXTENSION_API_BASE_URL) ||
  "https://fomo-firewall-birdeye.vercel.app";

chrome.runtime.onInstalled.addListener(() => {
  console.log("[FOMO Firewall] extension installed");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "ff:open-case-file" && typeof message.address === "string") {
    chrome.tabs.create({ url: `${BACKEND_URL}/token/${message.address}` });
    sendResponse({ ok: true });
    return true;
  }
  return false;
});
