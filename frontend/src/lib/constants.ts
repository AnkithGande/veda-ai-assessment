// ─── App ──────────────────────────────────────────────────────────────────────

export const APP_NAME = "Veda AI Assessment";
export const APP_VERSION = "1.0.0";

// ─── API / Socket ─────────────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

// ─── Routes ───────────────────────────────────────────────────────────────────
// Populated when feature routing is implemented.

export const ROUTES = {} as const;

// ─── Query Keys ───────────────────────────────────────────────────────────────
// Populated when data-fetching hooks are implemented.

export const QUERY_KEYS = {} as const;
