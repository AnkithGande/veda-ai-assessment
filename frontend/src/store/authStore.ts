"use client";

// ─── Storage keys ─────────────────────────────────────────────────────────────

const LS_AUTH_KEY = "veda-auth";
const LS_TOKEN_KEY = "veda-token";
const LS_PROFILE_KEY = "veda-profile";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id?: string;
  email: string;
  name: string;
  initials: string;
}

export interface UserProfile {
  name: string;
  email: string;
  school: string;
  bio: string;
  role: string;
  joinedDate: string;
}

// ─── Demo credentials (always works, no backend required) ─────────────────────

const DEMO = {
  email: "teacher@vedaai.com",
  password: "password123",
  name: "Teacher",
  initials: "T",
};

const DEFAULT_PROFILE: UserProfile = {
  name: "Teacher",
  email: "teacher@vedaai.com",
  school: "Greenwood High School",
  bio: "Passionate educator creating engaging assessments with AI.",
  role: "Teacher",
  joinedDate: "2025-01-15",
};

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(LS_TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(LS_TOKEN_KEY);
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export function setSession(user: AuthUser, token?: string): void {
  localStorage.setItem(LS_AUTH_KEY, JSON.stringify(user));
  if (token) setToken(token);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getUser() !== null;
}

// ─── Demo login (no backend) ──────────────────────────────────────────────────

export function loginDemo(email: string, password: string): AuthUser | null {
  if (
    email.trim().toLowerCase() === DEMO.email &&
    password === DEMO.password
  ) {
    const user: AuthUser = {
      email: DEMO.email,
      name: DEMO.name,
      initials: DEMO.initials,
    };
    setSession(user);
    return user;
  }
  return null;
}

// ─── Real auth session (from backend JWT) ─────────────────────────────────────

export function loginWithToken(
  apiUser: { id: string; name: string; email: string },
  token: string
): AuthUser {
  const user: AuthUser = {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    initials: apiUser.name.trim().charAt(0).toUpperCase(),
  };
  setSession(user, token);
  return user;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function logout(): void {
  localStorage.removeItem(LS_AUTH_KEY);
  clearToken();
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function getProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  const user = getUser();
  const base: UserProfile = {
    ...DEFAULT_PROFILE,
    name: user?.name ?? DEFAULT_PROFILE.name,
    email: user?.email ?? DEFAULT_PROFILE.email,
  };
  try {
    const raw = localStorage.getItem(LS_PROFILE_KEY);
    return raw ? { ...base, ...(JSON.parse(raw) as Partial<UserProfile>) } : base;
  } catch {
    return base;
  }
}

export function saveProfile(updates: Partial<UserProfile>): UserProfile {
  const current = getProfile();
  const updated = { ...current, ...updates };
  localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(updated));
  // Keep auth session name in sync
  const user = getUser();
  if (user && updates.name) {
    const initials = updates.name.trim().charAt(0).toUpperCase();
    setSession({ ...user, name: updates.name, initials });
  }
  return updated;
}
