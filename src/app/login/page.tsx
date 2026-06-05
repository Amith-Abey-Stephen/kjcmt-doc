"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, Loader2, ArrowRight, AlertTriangle, UserPlus, CheckCircle, X } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error || "Invalid credentials. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        setSuccess(data.message || "Registration successful. You can now sign in.");
        setName("");
        setEmail("");
        setPassword("");
        setTimeout(() => setMode("login"), 2000);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 overflow-hidden px-4">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
        <div className="w-full max-w-md animate-pulse">
          <div className="mb-8 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 mb-5 mx-auto" />
            <div className="h-8 w-40 bg-zinc-800 rounded mx-auto mb-2" />
            <div className="h-3 w-56 bg-zinc-800 rounded mx-auto" />
          </div>
          <div className="glass-card p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50">
            <div className="h-4 w-24 bg-zinc-800 rounded mb-6" />
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="h-3 w-20 bg-zinc-800 rounded" />
                <div className="h-10 w-full bg-zinc-800 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-16 bg-zinc-800 rounded" />
                <div className="h-10 w-full bg-zinc-800 rounded-xl" />
              </div>
              <div className="h-11 w-full bg-zinc-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 overflow-hidden px-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none animate-float" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-float" style={{ animationDelay: "-3s" }} />
      <div className="absolute top-1/3 right-10 w-[200px] h-[200px] bg-purple-400/5 rounded-full blur-[80px] pointer-events-none animate-float" style={{ animationDelay: "-1.5s" }} />

      <div className="absolute top-20 left-[20%] w-2 h-2 rounded-full bg-purple-500/40 blur-[2px] animate-float pointer-events-none" />
      <div className="absolute bottom-32 right-[25%] w-3 h-3 rounded-full bg-indigo-500/30 blur-[3px] animate-float pointer-events-none" style={{ animationDelay: "-2s" }} />

      <div className="w-full max-w-md animate-in">
        <div className="mb-8 text-center animate-in animate-in-delay-1">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white mb-5 shadow-[0_0_25px_rgba(139,92,246,0.3)] pulse-glow">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">CertSync</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Kristu Jyoti College of Management and Technology
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-2xl backdrop-blur-xl animate-in animate-in-delay-2">
          {/* Tab Switcher */}
          <div className="flex border-b border-zinc-800 mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${
                mode === "login" ? "text-purple-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Sign In
              {mode === "login" && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-purple-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${
                mode === "register" ? "text-purple-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Register
              {mode === "register" && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-purple-500 rounded-full" />
              )}
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-200 text-xs text-center animate-scale-in flex items-center justify-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400" htmlFor="email">
                  Faculty Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@kjc.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400" htmlFor="password">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-purple-800 disabled:to-indigo-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-purple-600/20 hover:shadow-xl hover:shadow-purple-600/30 active:translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-200 text-xs text-center animate-scale-in flex items-center justify-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-950/50 border border-green-500/30 text-green-200 text-xs text-center animate-scale-in flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>{success}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400" htmlFor="name">
                  Full Name
                </label>
                <div className="relative group">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Dr. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400" htmlFor="reg-email">
                  Faculty Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="name@kjc.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400" htmlFor="reg-password">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    id="reg-password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-emerald-800 disabled:to-teal-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 active:translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>
          )}
          
          <div className="mt-6 border-t border-zinc-800/80 pt-4 text-center">
            <span className="text-xs text-zinc-500">
              Demo: <code className="text-purple-400 font-mono bg-purple-500/10 px-1 py-0.5 rounded">admin@certsync.com</code> / <code className="text-purple-400 font-mono bg-purple-500/10 px-1 py-0.5 rounded">admin123</code>
            </span>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600 animate-in animate-in-delay-3">
          Powered by INOVUS LABS IEDC
        </p>
      </div>
    </div>
  );
}
