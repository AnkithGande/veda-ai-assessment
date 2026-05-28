// ─── App ──────────────────────────────────────────────────────────────────────

export const APP_NAME = "Veda AI Assessment";
export const APP_VERSION = "1.0.0";

// ─── API Base URL ─────────────────────────────────────────────────────────────
//
// Resolution order:
//   1. API_URL              — server-side runtime (set in Vercel dashboard)
//   2. NEXT_PUBLIC_API_URL  — build-time + client bundle
//   3. Hardcoded Render URL — absolute production safety net
//
// The URL is normalised: trailing slash stripped, then /api appended if missing.
// This ensures the URL is always correct even if the env var is set without /api.

const RAW_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://veda-ai-assessment-2zm7.onrender.com/api";

// Strip trailing slash, then ensure it ends with /api
function normaliseApiUrl(url: string): string {
  const stripped = url.replace(/\/+$/, ""); // remove trailing slashes
  if (stripped.endsWith("/api")) return stripped;
  return `${stripped}/api`;
}

export const API_BASE_URL = normaliseApiUrl(RAW_URL);

// ─── Socket URL ───────────────────────────────────────────────────────────────

export const SOCKET_URL =
  process.env.SOCKET_URL ??
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  "https://veda-ai-assessment-2zm7.onrender.com";

// ─── Routes ───────────────────────────────────────────────────────────────────

export const ROUTES = {} as const;

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const QUERY_KEYS = {} as const;
