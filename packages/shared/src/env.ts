/**
 * Tiny env helpers shared by every server-side surface (worker, web API routes,
 * Telegram bot, MCP servers). NEVER import this from a client component.
 */

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required env var: ${name}. Set it in .env before booting this surface.`
    );
  }
  return value;
}

export function getOptionalEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.length > 0 ? value : fallback;
}

export function getBooleanEnv(name: string, fallback = false): boolean {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw === "1" || raw.toLowerCase() === "true";
}

/**
 * Throws if invoked in a browser context. Server-only modules call this at
 * import time so an accidental client-side import fails loudly.
 */
export function assertServerOnly(moduleName: string): void {
  if (typeof window !== "undefined") {
    throw new Error(
      `[server-only] ${moduleName} was imported in a browser context. Move the import to a route handler, server component, or server action.`
    );
  }
}
