"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/login");
  }, [router]);

  // Poll audit activity logs in the background
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/audit-logs");
        if (res.ok) {
          const data = await res.json();
          // Display top 5 most recent audit log events
          setNotifications(data.slice(0, 5));

          // Highlight events logged in the last 15 minutes as unread count
          const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
          const newEvents = data.filter((log: any) => new Date(log.timestamp) > fifteenMinsAgo);
          setUnreadCount(newEvents.length);
        }
      } catch (err) {
        console.error("Failed to load alerts:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000); // 12 seconds
    return () => clearInterval(interval);
  }, [status]);

  const handleToggleNotifications = () => {
    if (!notificationsOpen) {
      setUnreadCount(0);
    }
    setNotificationsOpen(!notificationsOpen);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Click outside listener to automatically close active popovers/menus
  useEffect(() => {
    if (!notificationsOpen && !profileOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        notificationsOpen &&
        !target.closest("#notification-btn") &&
        !target.closest("#notification-menu")
      ) {
        setNotificationsOpen(false);
      }

      if (
        profileOpen &&
        !target.closest("#profile-btn") &&
        !target.closest("#profile-menu")
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [notificationsOpen, profileOpen]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-zinc-950">
        <aside className="hidden md:flex md:w-64 md:flex-col border-r border-zinc-900 bg-zinc-950/80">
          <div className="p-6 animate-pulse space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-zinc-800 rounded-xl" />
              <div className="space-y-1">
                <div className="h-4 w-20 bg-zinc-800 rounded" />
                <div className="h-2 w-24 bg-zinc-800 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 w-full bg-zinc-800 rounded-xl" />
              ))}
            </div>
            <div className="h-16 w-full bg-zinc-800 rounded-xl mt-auto" />
          </div>
        </aside>
        <div className="flex-1 md:pl-64">
          <header className="hidden md:flex items-center justify-between h-16 border-b border-zinc-900 bg-zinc-950/40 px-8">
            <div className="animate-pulse flex items-center gap-2">
              <div className="h-3 w-16 bg-zinc-800 rounded" />
              <div className="h-3 w-3 bg-zinc-800 rounded" />
              <div className="h-3 w-20 bg-zinc-800 rounded" />
            </div>
            <div className="animate-pulse flex items-center gap-3">
              <div className="h-8 w-8 bg-zinc-800 rounded-lg" />
              <div className="h-8 w-8 bg-zinc-800 rounded-full" />
            </div>
          </header>
          <main className="p-6 md:p-8 mt-16 md:mt-0">
            <div className="space-y-6 animate-pulse">
              <div className="h-5 w-32 bg-zinc-800 rounded" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 bg-zinc-800 rounded-2xl" />
                ))}
              </div>
              <div className="h-64 bg-zinc-800 rounded-2xl" />
            </div>
          </main>
        </div>
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-600/20">
              CS
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">CertSync</span>
              <p className="text-[8px] text-zinc-600 tracking-wider uppercase">Certificate Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-2 flex-1 px-3 space-y-1">
            {sidebarLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600/15 to-indigo-600/5 border-l-2 border-purple-500 text-white shadow-[inset_0_0_12px_rgba(139,92,246,0.06)]"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 hover:border-l-2 hover:border-zinc-700"
                  }`}
                >
                  <Icon
                    className={`mr-3 h-4 w-4 flex-shrink-0 transition-all duration-200 ${
                      isActive ? "text-purple-400 drop-shadow-[0_0_4px_rgba(139,92,246,0.3)]" : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer Stats */}
          <div className="mx-3 mt-4 mb-2 p-3 rounded-xl bg-zinc-900/30 border border-zinc-900/50">
            <p className="text-[9px] text-zinc-600 font-medium uppercase tracking-wider">System Status</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-zinc-400">All systems operational</span>
            </div>
          </div>
        </div>

        {/* Footer User Profile */}
        <div className="flex-shrink-0 flex border-t border-zinc-900 p-4 bg-zinc-950/40">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "F"}
              </div>
              <div className="ml-1">
                <p className="text-xs font-medium text-white truncate max-w-[110px]">
                  {session?.user?.name || "Faculty User"}
                </p>
                <p className="text-[9px] text-zinc-500 truncate max-w-[110px]">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all duration-200 hover:scale-110"
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg">
            CS
          </div>
          <div>
            <span className="text-md font-bold tracking-tight text-white">CertSync</span>
            <p className="text-[7px] text-zinc-600 uppercase tracking-wider">Certificate Portal</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-900/60 transition-all duration-200"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-zinc-950/95 backdrop-blur-xl z-20 border-b border-zinc-900 px-4 py-6 space-y-3 animate-slide-down">
          <nav className="space-y-1">
            {sidebarLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    isActive ? "bg-gradient-to-r from-purple-600/15 to-indigo-600/5 text-white border-l-2 border-purple-500" : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                  }`}
                >
                  <Icon className="mr-3 h-4 w-4 text-purple-400" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-3 text-sm font-medium text-zinc-400 hover:text-red-400 rounded-xl transition hover:bg-red-500/5"
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
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="text-zinc-600">CertSync</span>
            <span className="text-zinc-800">/</span>
            <span className="text-zinc-300 font-medium">
              {sidebarLinks.find((l) => l.href === pathname)?.name || "Dashboard"}
            </span>
          </div>

          {/* User Menu / Notifications */}
          <div className="flex items-center gap-3">
            {/* Notifications Button */}
            <div className="relative">
              <button
                id="notification-btn"
                onClick={handleToggleNotifications}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-all duration-200 relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-purple-500 flex items-center justify-center text-[7px] text-white font-bold border border-zinc-950">
                    <span className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-75" />
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div
                  id="notification-menu"
                  className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-800 shadow-2xl p-4 z-40 bg-zinc-950 text-xs animate-scale-in"
                >
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-zinc-800">
                    <h3 className="font-semibold text-white">Recent Alerts</h3>
                    {notifications.length > 0 && (
                      <span className="text-[9px] text-purple-400 font-medium">latest logs</span>
                    )}
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {notifications.length > 0 ? (
                      notifications.map((log: any) => {
                        const isSubmission = log.action === "Submission Received";
                        const isExport = log.action.includes("EXPORT") || log.action.includes("Export") || log.action.includes("Merge") || log.action.includes("Zip");
                        return (
                          <div
                            key={log._id}
                            className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-850 hover:border-zinc-700 transition cursor-default"
                          >
                            <div className="flex items-center justify-between">
                              <p className={`font-semibold text-[11px] ${
                                isSubmission ? "text-purple-400" : isExport ? "text-green-400" : "text-zinc-200"
                              }`}>
                                {log.action}
                              </p>
                              <span className="text-[8px] text-zinc-500">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                              {log.details}
                            </p>
                            <div className="flex justify-between items-center mt-1.5 text-[8px] text-zinc-600 font-medium">
                              <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                              <span>by {log.performedBy}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-[10px] text-zinc-600 font-medium">
                        No system activity alerts recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                id="profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white focus:outline-none group"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md group-hover:shadow-lg group-hover:shadow-purple-600/20 transition-all duration-200">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "F"}
                </div>
              </button>

              {profileOpen && (
                <div
                  id="profile-menu"
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-800 shadow-2xl py-1 z-40 bg-zinc-950 text-xs animate-scale-in"
                >
                  <div className="px-4 py-2.5 border-b border-zinc-800">
                    <p className="font-medium text-white text-[11px]">{session?.user?.name}</p>
                    <p className="text-[9px] text-zinc-500 truncate">{session?.user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/dashboard/settings");
                    }}
                    className="w-full text-left px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    Account Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
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
