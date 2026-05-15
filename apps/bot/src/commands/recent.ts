import type { AlertRecord } from "@fomo/shared";
import { fetchRecentAlerts, caseFileUrl } from "../api";
import { formatAlertRecord } from "../format";

/**
 * Handler for `/alerts`. Returns the most recent high-risk alerts (Critical
 * Trap + Exit Warning) joined into a single message body so the user gets a
 * single notification, not a flood.
 */
export async function handleRecentCommand(): Promise<string> {
  const raw = (await fetchRecentAlerts(5)) as AlertRecord[];
  const filtered = raw.filter(
    (a) => a.verdict === "Critical Trap" || a.verdict === "Exit Warning"
  );
  if (filtered.length === 0) {
    return "No high-risk alerts in the last 24h. The pipeline is watching — you'll be the first to know.";
  }
  return filtered
    .slice(0, 3)
    .map((a) => formatAlertRecord(a, caseFileUrl(a.tokenAddress)))
    .join("\n\n────────\n\n");
}
