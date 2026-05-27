import { API_BASE_URL } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function apiRegister(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });

  const json = await res.json();

  if (!res.ok) {
    // Surface the first validation detail if present, else the top-level error
    const msg =
      json.details?.[0]?.message ?? json.error ?? "Registration failed";
    throw new Error(msg);
  }

  return json.data as AuthResponse;
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function apiLogin(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error ?? "Invalid email or password");
  }

  return json.data as AuthResponse;
}

// ─── Me ───────────────────────────────────────────────────────────────────────

export async function apiMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Unauthorized");
  return json.data as AuthUser;
}
