"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, GraduationCap, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { loginWithToken, isLoggedIn } from "@/store/authStore";
import { apiRegister } from "@/services/auth";
import { cn } from "@/lib/utils";

function isValidEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

// ─── Password strength indicator ─────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    { label: "At least 6 characters", ok: password.length >= 6 },
    { label: "Contains a number", ok: /\d/.test(password) },
    { label: "Contains a letter", ok: /[a-zA-Z]/.test(password) },
  ];
  return (
    <div className="mt-2 space-y-1">
      {checks.map(({ label, ok }) => (
        <div key={label} className="flex items-center gap-1.5">
          <CheckCircle2 className={cn("h-3 w-3 shrink-0", ok ? "text-emerald-500" : "text-gray-300")} />
          <span className={cn("text-xs", ok ? "text-emerald-600" : "text-gray-400")}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (isLoggedIn()) router.replace("/home");
  }, [router]);

  function clearErrors() {
    setNameError(""); setEmailError(""); setPasswordError("");
    setConfirmError(""); setAuthError("");
  }

  function validateFields(): boolean {
    let valid = true;

    if (!name.trim()) {
      setNameError("Full name is required"); valid = false;
    } else if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters"); valid = false;
    } else setNameError("");

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

    if (!confirmPassword) {
      setConfirmError("Please confirm your password"); valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError("Passwords do not match"); valid = false;
    } else setConfirmError("");

    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    if (!validateFields()) return;

    setLoading(true);
    try {
      const { token, user } = await apiRegister(
        name.trim(), email.trim().toLowerCase(), password, confirmPassword
      );
      loginWithToken(user, token);
      router.replace("/home");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  }

  const inputBase = "h-10 w-full rounded-xl border bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:ring-2 focus:ring-gray-100";
  const inputOk = "border-gray-200 focus:border-gray-400";
  const inputErr = "border-red-300 focus:border-red-400 focus:ring-red-50";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 shadow-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">Create your account</h1>
          <p className="mt-1.5 text-sm text-gray-500">Join VedaAI and start creating AI-powered assessments</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm shadow-gray-100">
          <h2 className="mb-6 text-[15px] font-semibold text-gray-900">Sign up</h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {authError && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {authError}
              </div>
            )}

            {/* Full name */}
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">Full name</label>
              <input
                id="name" type="text" autoComplete="name" autoFocus
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(""); setAuthError(""); }}
                placeholder="Jane Smith"
                className={cn(inputBase, nameError ? inputErr : inputOk)}
              />
              {nameError && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3 shrink-0" />{nameError}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email" type="email" autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(""); setAuthError(""); }}
                onBlur={() => { if (email && !isValidEmail(email)) setEmailError("Enter a valid email address"); }}
                placeholder="you@example.com"
                className={cn(inputBase, emailError || authError ? inputErr : inputOk)}
              />
              {emailError && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3 shrink-0" />{emailError}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="password" type={showPassword ? "text" : "password"} autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                  placeholder="••••••••"
                  className={cn(inputBase, "pr-10", passwordError ? inputErr : inputOk)}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError
                ? <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3 shrink-0" />{passwordError}</p>
                : <PasswordStrength password={password} />
              }
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-gray-700">Confirm password</label>
              <div className="relative">
                <input
                  id="confirm" type={showConfirm ? "text" : "password"} autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(""); }}
                  placeholder="••••••••"
                  className={cn(inputBase, "pr-10", confirmError ? inputErr : inputOk)}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmError && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3 shrink-0" />{confirmError}</p>}
              {!confirmError && confirmPassword && password === confirmPassword && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />Passwords match
                </p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</> : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-gray-900 underline underline-offset-2 hover:text-gray-700">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">VedaAI Assessment Creator</p>
      </div>
    </div>
  );
}
