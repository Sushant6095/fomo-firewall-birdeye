import { assertServerOnly, getOptionalEnv } from "@fomo/shared";
import type { FomoDb } from "./types";
import { createMemoryDb } from "./memory";

assertServerOnly("@fomo/db");

/**
 * Returns the active `FomoDb` implementation.
 *
 * - When `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set, we *would*
 *   construct a Supabase-backed implementation. For the hackathon build we
 *   ship an in-memory implementation so the worker → web → bot path is
 *   demonstrable without a Supabase project.
 *
 * - When `FOMO_DB_DRIVER=memory` (or missing creds), we use the in-memory db.
 *
 * Swap the singleton with `setDb()` from tests or alternative drivers.
 */

let singleton: FomoDb | null = null;

export function getDb(): FomoDb {
  if (singleton) return singleton;

  const driver = getOptionalEnv("FOMO_DB_DRIVER", "memory");
  if (driver === "supabase") {
    throw new Error(
      "[db] supabase driver requested but not yet implemented in this build. Set FOMO_DB_DRIVER=memory or implement createSupabaseDb()."
    );
  }
  singleton = createMemoryDb();
  return singleton;
}

export function setDb(db: FomoDb): void {
  singleton = db;
}

export function resetDb(): void {
  singleton = null;
}
