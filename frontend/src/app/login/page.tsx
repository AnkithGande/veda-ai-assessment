"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, GraduationCap, Loader2, AlertCircle } from "lucide-react";
import { loginDemo, loginWithToken, isLoggedIn } from "@/store/authStore";
import { apiLogin } from "@/services/auth";
import { cn } from "@/lib/utils";

function isValidEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (isLoggedIn()) router.replace("/home");
  }, [router]);

  function clearErrors() {
    setEmailError("");
    setPasswordError("");
    setAuthError("");
  }

  function validateFields(): boolean {
    let valid = true;
    if (!email.trim()) {
      setEmailError("Email is required"); valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address"); valid = false;
    } else setEmailError("");

    if (!password) {
      setPasswordError("Password is required"); valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters"); valid = false;
    } else setPasswordError("");

    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    if (!validateFields()) return;

    setLoading(true);

    // 1. Try demo credentials first (no network needed)
    const demoUser = loginDemo(email.trim().toLowerCase(), password);
    if (demoUser) {
      router.replace("/home");
      return;
    }

    // 2. Try real backend
    try {
      const { token, user } = await apiLogin(email.trim().toLowerCase(), password);
      loginWithToken(user, token);
      router.replace("/home");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Invalid email or password");
      setLoading(false);
    }
  }

  const emailInvalid = !!emailError || !!authError;
  const passwordInvalid = !!passwordError || !!authError;

  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 shadow-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">Welcome to VedaAI</h1>
          <p className="mt-1.5 text-sm text-gray-500">AI-powered assessment creator for educators</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm shadow-gray-100">
          <h2 className="mb-6 text-[15px] font-semibold text-gray-900">Sign in to your account</h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {authError && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {authError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email" type="email" autoComplete="email" autoFocus
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearErrors(); }}
                onBlur={() => { if (email && !isValidEmail(email)) setEmailError("Enter a valid email address"); }}
                placeholder="you@example.com"
                className={cn(
                  "h-10 w-full rounded-xl border bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:ring-2 focus:ring-gray-100",
                  emailInvalid ? "border-red-300 focus:border-red-400 focus:ring-red-50" : "border-gray-200 focus:border-gray-400"
                )}
              />
              {emailError && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3 shrink-0" />{emailError}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="password" type={showPassword ? "text" : "password"} autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearErrors(); }}
                  placeholder="••••••••"
                  className={cn(
                    "h-10 w-full rounded-xl border bg-white px-3 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:ring-2 focus:ring-gray-100",
                    passwordInvalid ? "border-red-300 focus:border-red-400 focus:ring-red-50" : "border-gray-200 focus:border-gray-400"
                  )}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3 shrink-0" />{passwordError}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</> : "Sign in"}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-5 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-gray-900 underline underline-offset-2 hover:text-gray-700">
              Create account
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs font-semibold text-blue-700 mb-1">Demo credentials</p>
            <p className="text-xs text-blue-600"><span className="font-medium">Email:</span> teacher@vedaai.com</p>
            <p className="text-xs text-blue-600"><span className="font-medium">Password:</span> password123</p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">VedaAI Assessment Creator · Demo Mode</p>
      </div>
    </div>
  );
}
