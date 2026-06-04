"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 overflow-hidden px-4">
      {/* Decorative gradient glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/10 border border-purple-500/30 text-purple-400 mb-4 shadow-[0_0_15px_rgba(139,92,246,0.15)] pulse-glow">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">CertSync</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Kristu Jyoti College of Management and Technology
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Faculty Portal</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Sign in to manage form collections, run comparisons, and export NAAC bundles.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-200 text-xs text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400" htmlFor="email">
                Faculty Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@kjc.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-zinc-400" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-medium rounded-xl text-sm transition duration-200 shadow-lg shadow-purple-600/20 active:translate-y-0.5"
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
          
          <div className="mt-6 border-t border-zinc-800/80 pt-4 text-center">
            <span className="text-xs text-zinc-500">
              Demo access: <code className="text-purple-400 font-mono">admin@certsync.com</code> / <code className="text-purple-400 font-mono">admin123</code>
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-zinc-600">
          Powered by INOVUS LABS IEDC
        </p>
      </div>
    </div>
  );
}
