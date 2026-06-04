"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Inbox,
  BarChart3,
  DownloadCloud,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  Search,
  Loader2,
  Lock,
} from "lucide-react";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Forms", href: "/dashboard/forms", icon: FileText },
  { name: "Submissions", href: "/dashboard/submissions", icon: Inbox },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Export Center", href: "/dashboard/export", icon: DownloadCloud },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-950 gap-4">
        <Lock className="h-10 w-10 text-red-500 animate-pulse" />
        <span className="text-zinc-400 text-sm">Redirecting to login...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-slate-100">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-zinc-900 bg-zinc-950/80 backdrop-blur-xl z-20">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo Branding */}
          <div className="flex items-center px-6 mb-8 gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-400 font-bold text-sm shadow-[0_0_10px_rgba(139,92,246,0.15)]">
              CS
            </div>
            <span className="text-lg font-bold tracking-tight text-white bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              CertSync
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="mt-2 flex-1 px-4 space-y-1.5">
            {sidebarLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition duration-200 ${
                    isActive
                      ? "bg-purple-600/10 border-l-2 border-purple-500 text-white shadow-[inset_0_0_8px_rgba(139,92,246,0.05)]"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                  }`}
                >
                  <Icon
                    className={`mr-3 h-4 w-4 flex-shrink-0 transition duration-200 ${
                      isActive ? "text-purple-400" : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Profile */}
        <div className="flex-shrink-0 flex border-t border-zinc-900 p-4 bg-zinc-950/40">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-purple-400">
                {session?.user?.name ? session.user.name.charAt(0) : "F"}
              </div>
              <div className="ml-1">
                <p className="text-xs font-medium text-white truncate max-w-[120px]">
                  {session?.user?.name || "Faculty User"}
                </p>
                <p className="text-[10px] text-zinc-500 truncate max-w-[120px]">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition duration-200"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER & NAV TOGGLE */}
      <div className="md:hidden flex items-center justify-between h-16 w-full fixed top-0 inset-x-0 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl px-4 z-30">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-400 font-bold text-sm">
            CS
          </div>
          <span className="text-md font-bold tracking-tight text-white">CertSync</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-900/60"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-zinc-950 z-20 border-b border-zinc-900 px-4 py-6 space-y-3 transition duration-200">
          <nav className="space-y-1">
            {sidebarLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                    isActive ? "bg-purple-600/10 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Icon className="mr-3 h-4 w-4 text-purple-400" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center px-4 py-3 text-sm font-medium text-zinc-400 hover:text-red-400 rounded-xl transition"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* CONTENT AREA CONTAINER */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* TOPBAR */}
        <header className="hidden md:flex items-center justify-between h-16 border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-xl px-8 sticky top-0 z-10">
          {/* Top Search bar */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search database..."
              className="w-full pl-9 pr-4 py-1.5 bg-zinc-900/40 border border-zinc-900 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-800 transition duration-200"
            />
          </div>

          {/* User Menu / Notifications */}
          <div className="flex items-center gap-4">
            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition duration-200"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 glass-card rounded-xl border border-zinc-800 shadow-2xl p-4 z-40 bg-zinc-900/90 text-xs">
                  <h3 className="font-semibold text-white mb-2 pb-1.5 border-b border-zinc-800">Recent Alerts</h3>
                  <div className="space-y-2">
                    <div className="p-2 rounded bg-zinc-950/40 border border-zinc-800/50">
                      <p className="text-zinc-300 font-medium">Deadline Approaching</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Form "NPTEL BCA 2026" expires in 2 days.</p>
                    </div>
                    <div className="p-2 rounded bg-zinc-950/40 border border-zinc-800/50">
                      <p className="text-zinc-300 font-medium">New Submissions Uploaded</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">5 student uploads received in the last hour.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white focus:outline-none"
              >
                <div className="h-7 w-7 rounded-full bg-purple-600/20 border border-purple-500/20 flex items-center justify-center text-xs font-semibold text-purple-400">
                  {session?.user?.name ? session.user.name.charAt(0) : "F"}
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl border border-zinc-800 shadow-2xl py-1 z-40 bg-zinc-900/95 text-xs">
                  <div className="px-4 py-2 border-b border-zinc-800">
                    <p className="font-medium text-white">{session?.user?.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{session?.user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/dashboard/settings");
                    }}
                    className="w-full text-left px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    Account Settings
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN ROUTE CONTENT */}
        <main className="flex-1 p-6 md:p-8 mt-16 md:mt-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
