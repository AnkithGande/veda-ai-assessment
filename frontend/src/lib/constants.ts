// ─── App ──────────────────────────────────────────────────────────────────────

export const APP_NAME = "Veda AI Assessment";
export const APP_VERSION = "1.0.0";

// ─── API Base URL ─────────────────────────────────────────────────────────────
//
// NEXT_PUBLIC_API_URL  — inlined at build time for client components
// API_URL             — available at runtime for server components (no NEXT_PUBLIC_ prefix)
//
// Both must be set in Vercel Dashboard → Settings → Environment Variables.
// The NEXT_PUBLIC_ prefix makes the value available in the browser bundle.
// The non-prefixed API_URL is used by server-side fetch calls (SSR/RSC).
//
// Fallback chain:
//   1. API_URL (server-side runtime, set in Vercel)
//   2. NEXT_PUBLIC_API_URL (build-time, also works server-side when set)
//   3. Hardcoded Render URL (production safety net — never hits localhost)

const RENDER_API = "https://veda-ai-assessment-2zm7.onrender.com/api";

export const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  RENDER_API;

// ─── Socket URL ───────────────────────────────────────────────────────────────

const RENDER_SOCKET = "https://veda-ai-assessment-2zm7.onrender.com";

export const SOCKET_URL =
  process.env.SOCKET_URL ??
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  RENDER_SOCKET;

// ─── Routes ───────────────────────────────────────────────────────────────────

export const ROUTES = {} as const;

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const QUERY_KEYS = {} as const;
