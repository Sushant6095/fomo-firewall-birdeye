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

const BACKEND_URL = "http://localhost:3000";

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
